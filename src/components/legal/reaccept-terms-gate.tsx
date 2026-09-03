"use client";

import { FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useReacceptConsent } from "@/hooks/mutations/useReacceptConsent";
import { ApiError } from "@/lib/api-client";
import type { ConsentStatusDTO } from "@/types/legal";

/**
 * Tela cheia de re-aceite obrigatório dos Termos de Uso. Renderizada pelo
 * layout autenticado NO LUGAR do app quando o backend indica
 * `mustReacceptTerms` — o usuário conseguiu logar, mas fica retido aqui até
 * aceitar. Não é dispensável (sem sidebar, sem navegação); a única saída é
 * aceitar ou sair.
 *
 * Os dois toggles opcionais aparecem porque a Política de Privacidade também
 * pode ter mudado — vêm pré-marcados com o último valor conhecido do usuário.
 */
export function ReacceptTermsGate({ status }: { status: ConsentStatusDTO }) {
  const router = useRouter();
  const reaccept = useReacceptConsent();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketing, setMarketing] = useState(status.marketingConsent);
  const [algorithm, setAlgorithm] = useState(
    status.algorithmImprovementConsent
  );

  function handleSubmit() {
    if (!acceptedTerms) {
      toast.error("Marque a caixa de aceite dos Termos de Uso para continuar.");
      return;
    }
    reaccept.mutate(
      {
        acceptedTermsOfUse: true,
        acceptedMarketingCommunications: marketing,
        acceptedAlgorithmImprovement: algorithm,
      },
      {
        onSuccess: () => {
          toast.success("Termos aceitos. Bom trabalho!");
          router.refresh();
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível registrar o aceite. Tente novamente."
          );
        },
      }
    );
  }

  return (
    <div className="bg-background fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="border-border bg-card w-full max-w-lg rounded-xl border p-6 shadow-lg sm:p-8">
        <div className="bg-primary/10 text-primary mb-4 flex size-11 items-center justify-center rounded-full">
          <ShieldCheck className="size-6" />
        </div>

        <h1 className="text-xl font-bold tracking-tight">
          Atualizamos os Termos de Uso
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {status.activeTermsVersion
            ? `A versão ${status.activeTermsVersion} dos Termos de Uso está em vigor. `
            : "Uma nova versão dos Termos de Uso está em vigor. "}
          Para continuar usando o Nexus, você precisa lê-la e aceitá-la.
        </p>

        {status.termsSummaryOfChanges ? (
          <div className="border-border bg-muted/40 mt-4 rounded-md border p-3 text-sm">
            <p className="mb-1 font-medium">O que mudou nesta versão</p>
            <p className="text-muted-foreground">
              {status.termsSummaryOfChanges}
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href="/terms"
            target="_blank"
            rel="noreferrer"
            className="text-primary inline-flex items-center gap-1.5 font-medium hover:underline"
          >
            <FileText className="size-4" />
            Ler os Termos de Uso
          </Link>
          <Link
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-primary inline-flex items-center gap-1.5 font-medium hover:underline"
          >
            <FileText className="size-4" />
            Ler a Política de Privacidade
          </Link>
        </div>

        <div className="border-border mt-5 space-y-4 border-t pt-5">
          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox
              checked={acceptedTerms}
              onCheckedChange={(v) => setAcceptedTerms(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm">
              Li e aceito os Termos de Uso
              {status.activeTermsVersion
                ? ` (versão ${status.activeTermsVersion})`
                : ""}
              . <span className="text-destructive">*</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox
              checked={marketing}
              onCheckedChange={(v) => setMarketing(v === true)}
              className="mt-0.5"
            />
            <span className="text-muted-foreground text-sm">
              Aceito receber comunicações de marketing (novidades e conteúdos).
              Opcional.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox
              checked={algorithm}
              onCheckedChange={(v) => setAlgorithm(v === true)}
              className="mt-0.5"
            />
            <span className="text-muted-foreground text-sm">
              Autorizo o uso de dados para melhoria do algoritmo de
              compatibilidade. Opcional — não afeta o cálculo do seu próprio
              score.
            </span>
          </label>
        </div>

        <Button
          className="mt-6 w-full"
          onClick={handleSubmit}
          disabled={!acceptedTerms || reaccept.isPending}
        >
          {reaccept.isPending ? "Registrando…" : "Aceitar e continuar"}
        </Button>
      </div>
    </div>
  );
}
