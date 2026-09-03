import { AlertTriangle, ArrowLeft, History } from "lucide-react";
import Link from "next/link";

import { LegalMarkdown } from "@/components/legal/legal-markdown";
import type { LegalDocumentDTO } from "@/types/legal";

/**
 * Corpo compartilhado das páginas legais (/terms, /privacy e as telas de
 * versão específica). O aviso de MINUTA é FIXO — renderizado aqui
 * independentemente do que o conteúdo do documento traz —, então continua
 * visível mesmo que uma versão futura publicada pelo Admin remova o aviso do
 * texto.
 */
export function LegalDocumentView({
  doc,
  slug,
  historical = false,
}: {
  doc: LegalDocumentDTO;
  slug: "terms" | "privacy";
  historical?: boolean;
}) {
  const publishedAt = new Date(doc.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="mx-auto max-w-3xl">
      {/* Aviso fixo de minuta — não depende do conteúdo do documento. */}
      <div className="border-warning/40 bg-warning/10 text-foreground mb-6 flex items-start gap-3 rounded-lg border p-4 text-sm">
        <AlertTriangle className="text-warning mt-0.5 size-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">MINUTA — PENDENTE DE REVISÃO JURÍDICA</p>
          <p className="text-muted-foreground text-xs">
            Este texto é um rascunho estruturado e ainda não foi revisado por
            advogado(a) especializado(a) em LGPD. Não constitui documento
            jurídico válido e não deve ser considerado definitivo.
          </p>
        </div>
      </div>

      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{doc.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Versão {doc.version}
          {doc.active ? " (vigente)" : " (histórica)"} · publicada em{" "}
          {publishedAt}
        </p>
        {doc.summaryOfChanges ? (
          <p className="text-muted-foreground mt-2 text-sm">
            <span className="font-medium">O que mudou nesta versão:</span>{" "}
            {doc.summaryOfChanges}
          </p>
        ) : null}
      </header>

      {historical ? (
        <div className="border-border bg-muted/40 text-muted-foreground mb-4 rounded-md border p-3 text-xs">
          Você está vendo uma versão histórica.{" "}
          <Link
            href={`/${slug}`}
            className="text-primary font-medium underline underline-offset-2"
          >
            Ver a versão vigente
          </Link>
          .
        </div>
      ) : null}

      <LegalMarkdown content={doc.content} />

      <footer className="border-border mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
        <Link
          href={`/${slug}/versions`}
          className="text-primary inline-flex items-center gap-1.5 font-medium hover:underline"
        >
          <History className="size-4" />
          Ver versões anteriores
        </Link>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="size-4" />
          Voltar para a Home
        </Link>
      </footer>
    </article>
  );
}

export function LegalDocumentUnavailable({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="border-border rounded-lg border p-6 text-center">
        <h1 className="text-lg font-semibold">{label} indisponível</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Não foi possível carregar este documento agora. Tente novamente em
          instantes.
        </p>
      </div>
    </div>
  );
}
