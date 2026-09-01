"use client";

import { MessageSquarePlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOpenSupportConversation } from "@/hooks/mutations/useSupportActions";
import { useAdminUsers } from "@/hooks/queries/useAdminUsers";
import { ApiError } from "@/lib/api-client";

export function OpenSupportConversationDialog() {
  const router = useRouter();
  const { data: users } = useAdminUsers();
  const open = useOpenSupportConversation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const candidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (users ?? [])
      .filter((u) => u.type !== "ADMIN")
      .filter(
        (u) =>
          !term ||
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      )
      .slice(0, 8);
  }, [users, search]);

  function reset() {
    setSearch("");
    setUserId(null);
    setSubject("");
    setMessage("");
  }

  function handleSubmit() {
    if (userId == null) return;
    open.mutate(
      {
        userId,
        subject: subject.trim() || null,
        message: message.trim() || null,
      },
      {
        onSuccess: (conv) => {
          toast.success("Conversa de suporte aberta.");
          setDialogOpen(false);
          reset();
          router.push(`/admin/support/${conv.id}`);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível abrir a conversa."
          ),
      }
    );
  }

  const selectedUser = users?.find((u) => u.id === userId);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(next) => {
        setDialogOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <MessageSquarePlus className="size-4" />
          Abrir conversa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir conversa de suporte</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="support-user">Com quem</Label>
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                <span>
                  {selectedUser.name}{" "}
                  <span className="text-muted-foreground">
                    ·{" "}
                    {selectedUser.type === "PROFESSIONAL"
                      ? "Profissional"
                      : "Contratante"}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserId(null)}
                >
                  Trocar
                </Button>
              </div>
            ) : (
              <>
                <Input
                  id="support-user"
                  placeholder="Buscar por nome ou e-mail…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {candidates.length === 0 ? (
                    <p className="text-muted-foreground p-3 text-xs">
                      Nenhum usuário encontrado.
                    </p>
                  ) : (
                    candidates.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setUserId(u.id)}
                        className="hover:bg-accent flex w-full items-center justify-between gap-2 border-b p-2 text-left text-sm last:border-b-0"
                      >
                        <span className="min-w-0 truncate">
                          {u.name}
                          <span className="text-muted-foreground">
                            {" "}
                            · {u.email}
                          </span>
                        </span>
                        <span className="text-muted-foreground shrink-0 text-[11px]">
                          {u.type === "PROFESSIONAL" ? "Prof." : "Contrat."}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="support-subject">Assunto (opcional)</Label>
            <Input
              id="support-subject"
              maxLength={200}
              placeholder="Ex.: Divergência na confirmação do projeto X"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="support-message">
              Primeira mensagem (opcional)
            </Label>
            <Textarea
              id="support-message"
              rows={3}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={userId == null || open.isPending}
            onClick={handleSubmit}
          >
            {open.isPending ? "Abrindo…" : "Abrir conversa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
