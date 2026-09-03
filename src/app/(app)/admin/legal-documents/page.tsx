"use client";

import { AlertTriangle } from "lucide-react";

import { LegalDocumentCard } from "@/components/admin/legal-document-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLegalDocuments } from "@/hooks/queries/useLegalDocuments";

export default function AdminLegalDocumentsPage() {
  const { data, isLoading } = useLegalDocuments();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documentos legais</h1>
        <p className="text-muted-foreground text-sm">
          Publique novas versões dos Termos de Uso e da Política de Privacidade.
          Cada versão fica registrada; publicar Termos aciona o reaceite
          obrigatório.
        </p>
      </div>

      <div className="border-warning/40 bg-warning/10 text-foreground flex items-start gap-3 rounded-lg border p-4 text-sm">
        <AlertTriangle className="text-warning mt-0.5 size-5 shrink-0" />
        <p className="text-muted-foreground text-xs">
          O texto atualmente publicado é uma <strong>minuta</strong> gerada para
          a implementação e{" "}
          <strong>ainda não passou por revisão jurídica</strong>. Substitua-o
          pelo texto validado por advogado(a) especializado(a) em LGPD antes de
          qualquer uso real.
        </p>
      </div>

      {isLoading || !data ? (
        <>
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </>
      ) : (
        <>
          <LegalDocumentCard view={data.termsOfUse} />
          <LegalDocumentCard view={data.privacyPolicy} />
        </>
      )}
    </div>
  );
}
