import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import type { LegalDocumentVersionDTO } from "@/types/legal";

export function LegalVersionList({
  slug,
  label,
  versions,
}: {
  slug: "terms" | "privacy";
  label: string;
  versions: LegalDocumentVersionDTO[];
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {label} — histórico de versões
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Todas as versões já publicadas. A vigente está marcada.
        </p>
      </header>

      {versions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhuma versão disponível no momento.
        </p>
      ) : (
        <ul className="divide-border border-border divide-y rounded-lg border">
          {versions.map((v) => {
            const publishedAt = new Date(v.publishedAt).toLocaleDateString(
              "pt-BR",
              { day: "2-digit", month: "long", year: "numeric" }
            );
            const href = v.active
              ? `/${slug}`
              : `/${slug}/versions/${v.version}`;
            return (
              <li key={v.id}>
                <Link
                  href={href}
                  className="hover:bg-accent/50 flex flex-col gap-1 p-4 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Versão {v.version}</span>
                    {v.active ? (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                        Vigente
                      </span>
                    ) : null}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    Publicada em {publishedAt}
                    {v.publishedByAdminEmail
                      ? ` por ${v.publishedByAdminEmail}`
                      : " pelo sistema"}
                  </span>
                  {v.summaryOfChanges ? (
                    <span className="text-muted-foreground mt-0.5 text-sm">
                      {v.summaryOfChanges}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6">
        <Link
          href={`/${slug}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar para a versão vigente
        </Link>
      </div>
    </div>
  );
}
