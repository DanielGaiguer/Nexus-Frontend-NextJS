import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  billingChargesKey,
  billingStatusKey,
} from "@/hooks/queries/useBilling";
import { apiFetch } from "@/lib/api-client";
import type { BillingStatusDTO } from "@/types/billing";

function useInvalidateBilling() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: billingStatusKey() });
    queryClient.invalidateQueries({ queryKey: billingChargesKey() });
    // Ações de match/proposta voltam a ser permitidas quando desbloqueia.
    queryClient.invalidateQueries({ queryKey: ["company", "matches"] });
    queryClient.invalidateQueries({ queryKey: ["company", "proposals"] });
  };
}

export function useSaveCard() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: (cardToken: string) =>
      apiFetch<BillingStatusDTO>("/api/company/billing/card", {
        method: "POST",
        body: { cardToken },
      }),
    onSuccess: invalidate,
  });
}

export function useRemoveCard() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () =>
      apiFetch<BillingStatusDTO>("/api/company/billing/card", {
        method: "DELETE",
      }),
    onSuccess: invalidate,
  });
}

export function useRetryCharge() {
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () =>
      apiFetch<BillingStatusDTO>("/api/company/billing/retry-charge", {
        method: "POST",
      }),
    onSuccess: invalidate,
  });
}
