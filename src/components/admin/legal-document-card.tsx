"use client";

import { Eye, EyeOff, FileText, History } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { LegalMarkdown } from "@/components/legal/legal-markdown";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePublishLegalDocument } from "@/hooks/mutations/useLegalDocumentActions";
import { ApiError } from "@/lib/api-client";
import type { AdminLegalTypeView } from "@/types/legal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export function LegalDocumentCard({ view }: { view: AdminLegalTypeView }) {
  const publish = usePublishLegalDocument();
  const label =
    view.type === "TERMS_OF_USE" ? "Termos de Uso" : "Política de Privacidade";
  const isTerms = view.type === "TERMS_OF_USE";

  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [preview, setPreview] = useState(false);

  const nextVersion = (view.active?.version ?? 0) + 1;
  const canPublish = content.trim().length > 0 && !publish.isPending;

  function handlePublish() {
    if (!canPublish) return;
    publish.mutate(
      {
        slug: view.slug,
        body: {
          content: content.trim(),
          summaryOfChanges: summary.trim() || null,
        },
      },
      {
        onSuccess: (doc) => {
          toast.success(`${label}: versão ${doc.version} publicada.`);
          setContent("");
          setSummary("");
          setPreview(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível publicar a nova versão."
          ),
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="text-primary size-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {view.active ? (
          <div className="text-muted-foreground text-xs">
            Versão vigente: <strong>v{view.active.version}</strong> · publicada
            em {formatDate(view.active.publishedAt)}
            {view.active.publishedByAdminEmail
              ? ` por ${view.active.publishedByAdminEmail}`
              : " pelo sistema"}
            {" · "}
            <Link
              href={`/${view.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              ver página pública
            </Link>
          </div>
        ) : (
          <p className="text-destructive text-xs">
            Nenhuma versão ativa — verifique o seed do backend.
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor={`${view.slug}-content`}>
            Conteúdo da nova versão (v{nextVersion}) — Markdown
          </Label>
          <Textarea
            id={`${view.slug}-content`}
            rows={12}
            className="font-mono text-xs"
            placeholder="# Título&#10;&#10;Cole ou escreva o texto em Markdown…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="text-muted-foreground text-xs">
            HTML embutido é exibido como texto literal, nunca interpretado.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${view.slug}-summary`}>
            O que mudou nesta versão (opcional)
          </Label>
          <Input
            id={`${view.slug}-summary`}
            placeholder="Resumo exibido na tela de reaceite"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreview((p) => !p)}
            disabled={!content.trim()}
          >
            {preview ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
            {preview ? "Ocultar preview" : "Pré-visualizar"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" size="sm" disabled={!canPublish}>
                {publish.isPending ? "Publicando…" : "Publicar nova versão"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Publicar v{nextVersion} de {label}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  A versão vigente passa a ser a v{nextVersion} e as anteriores
                  ficam como histórico.
                  {isTerms ? (
                    <>
                      {" "}
                      <strong>
                        Todos os usuários com aceite de uma versão anterior
                        serão levados à tela de reaceite obrigatório no próximo
                        acesso
                      </strong>{" "}
                      — inclusive administradores. Chamadas de escrita à API
                      ficam bloqueadas (428) até o reaceite.
                    </>
                  ) : null}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handlePublish}>
                  Publicar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {preview && content.trim() ? (
          <div className="border-border rounded-md border p-4">
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Preview
            </p>
            <LegalMarkdown content={content} />
          </div>
        ) : null}

        {view.history.length > 0 ? (
          <div className="border-border border-t pt-3">
            <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium">
              <History className="size-3.5" />
              Histórico ({view.history.length})
            </p>
            <ul className="space-y-1.5 text-xs">
              {view.history.map((v) => (
                <li key={v.id} className="flex flex-wrap gap-x-2">
                  <span className="font-medium">v{v.version}</span>
                  {v.active ? (
                    <span className="text-primary">(vigente)</span>
                  ) : null}
                  <span className="text-muted-foreground">
                    {formatDate(v.publishedAt)}
                  </span>
                  {v.summaryOfChanges ? (
                    <span className="text-muted-foreground w-full sm:w-auto">
                      — {v.summaryOfChanges}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
