import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { PortalSubscriptionChargeDTO } from "@/types/custom-portal";

/** Cadastra/troca o cartão da assinatura da plataforma. Token gerado no frontend. */
export function useSavePortalSubscriptionCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardToken: string) =>
      apiFetch("/api/company/custom-portal/subscription/card", {
        method: "POST",
        body: { cardToken },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company", "custom-portal", "subscription"],
      });
    },
  });
}

/** Modo simulate: o Admin decide o resultado de uma mensalidade (sem Mercado Pago). */
export function useSimulatePortalCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chargeId,
      outcome,
    }: {
      chargeId: number;
      outcome: "approved" | "rejected";
    }) =>
      apiFetch<PortalSubscriptionChargeDTO>(
        `/api/admin/portal-subscription-charges/${chargeId}/simulate`,
        { method: "POST", body: { outcome } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "portal-subscription-charges"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "custom-portals"] });
    },
  });
}
