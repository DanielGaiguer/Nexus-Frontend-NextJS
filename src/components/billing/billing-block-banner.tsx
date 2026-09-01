"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useBillingStatus } from "@/hooks/queries/useBilling";

/**
 * Aviso de bloqueio por pendência de pagamento (Prompt 5). Aparece no dashboard /
 * matches / propostas do contratante quando ele está impedido de fechar novas
 * contratações. Não renderiza nada quando não há bloqueio.
 */
export function BillingBlockBanner() {
  const { data } = useBillingStatus();
  if (!data?.blocked) return null;

  return (
    <div className="border-destructive/40 bg-destructive/5 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
        <div className="text-sm">
          <span className="text-destructive font-semibold">
            Fechamento de novas contratações bloqueado.
          </span>{" "}
          <span className="text-muted-foreground">
            {data.blockMessage} Regularize seu pagamento para voltar a fechar
            matches e aceitar propostas.
          </span>
        </div>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href="/company/billing">Ir para Financeiro</Link>
      </Button>
    </div>
  );
}
