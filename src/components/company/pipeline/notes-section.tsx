"use client";

import { NotebookPen, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCandidateNote,
  useDeleteCandidateNote,
  useUpdateCandidateNote,
} from "@/hooks/mutations/useCandidateDetailActions";
import { useCandidateNotes } from "@/hooks/queries/useCandidateDetail";
import { ApiError } from "@/lib/api-client";
import type { CompanyCandidateNoteDTO } from "@/types/candidate";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function NoteRow({
  note,
  professionalId,
}: {
  note: CompanyCandidateNoteDTO;
  professionalId: number;
}) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState("");
  const update = useUpdateCandidateNote(professionalId);
  const remove = useDeleteCandidateNote(professionalId);

  function startEdit() {
    setEditBody(note.body);
    setEditing(true);
  }

  function saveEdit() {
    const trimmed = editBody.trim();
    if (!trimmed) return;
    update.mutate(
      { noteId: note.id, body: trimmed },
      {
        onSuccess: () => {
          toast.success("Nota atualizada.");
          setEditing(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível atualizar a nota."
          ),
      }
    );
  }

  function confirmDelete() {
    remove.mutate(note.id, {
      onSuccess: () => toast.success("Nota apagada."),
      onError: (error) =>
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível apagar a nota."
        ),
    });
  }

  return (
    <li className="rounded-md border p-3 text-sm">
      <div className="text-muted-foreground mb-1 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span>
          <span className="text-foreground font-medium">
            {note.authorLabel}
          </span>{" "}
          · {formatWhen(note.createdAt)}
          {note.updatedAt !== note.createdAt && " · editada"}
        </span>
        {note.canEdit && !editing && (
          <span className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Editar nota"
              onClick={startEdit}
            >
              <Pencil className="size-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive size-7"
                  aria-label="Apagar nota"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apagar esta nota?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Apagar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </span>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea
            rows={3}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            aria-label="Editar nota"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={saveEdit}
              disabled={update.isPending || editBody.trim() === ""}
            >
              {update.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap">{note.body}</p>
      )}
    </li>
  );
}

/**
 * Notas internas sobre o candidato. Lista TODAS as notas da equipe sobre este profissional
 * (transparência); botões de editar/apagar só aparecem onde `canEdit` (autor original ou OWNER,
 * regra do backend). Criar uma nota aqui a vincula a este processo (matchId).
 */
export function NotesSection({
  professionalId,
  matchId,
}: {
  professionalId: number;
  matchId: number;
}) {
  const { data: notes, isLoading } = useCandidateNotes(professionalId);
  const create = useCreateCandidateNote(professionalId);
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    create.mutate(
      { matchId, body: trimmed },
      {
        onSuccess: () => {
          toast.success("Nota adicionada.");
          setDraft("");
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível adicionar a nota."
          ),
      }
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <NotebookPen className="size-4" />
        Notas internas
      </h3>

      <div className="space-y-2">
        <Textarea
          rows={3}
          placeholder="Escreva uma nota interna sobre este candidato…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Nova nota interna"
        />
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={add}
            disabled={create.isPending || draft.trim() === ""}
          >
            {create.isPending ? "Adicionando…" : "Adicionar nota"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !notes || notes.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhuma nota ainda. Seja o primeiro da equipe a registrar uma
          impressão.
        </p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              professionalId={professionalId}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
