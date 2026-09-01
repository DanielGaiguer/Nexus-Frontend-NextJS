import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CommissionChargeDTO } from "@/types/billing";

/** Modo simulate: o Admin decide o resultado de uma cobrança (sem Mercado Pago). */
export function useSimulateCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chargeId,
      outcome,
    }: {
      chargeId: number;
      outcome: "approved" | "rejected";
    }) =>
      apiFetch<CommissionChargeDTO>(
        `/api/admin/commission-charges/${chargeId}/simulate`,
        { method: "POST", body: { outcome } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "commission-charges"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "confirmations"] });
    },
  });
}
