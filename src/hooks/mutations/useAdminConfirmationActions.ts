import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  AdminCompanyConfirmationOverviewDTO,
  AdminMatchConfirmationDTO,
} from "@/types/admin";

function useInvalidateConfirmations() {
  const queryClient = useQueryClient();
  return (companyId?: number) => {
    // Prefixo cobre queue, list, pending-reconciliation.
    queryClient.invalidateQueries({ queryKey: ["admin", "confirmations"] });
    // Os cards de match carregam o bloco `confirmation`.
    queryClient.invalidateQueries({ queryKey: ["matches"] });
    if (companyId != null) {
      queryClient.invalidateQueries({
        queryKey: ["admin", "company", companyId, "confirmations"],
      });
    }
  };
}

export function useReviewConfirmation() {
  const invalidate = useInvalidateConfirmations();
  return useMutation({
    mutationFn: ({ matchId, note }: { matchId: number; note: string | null }) =>
      apiFetch<AdminMatchConfirmationDTO>(
        `/api/admin/confirmations/${matchId}/review`,
        { method: "POST", body: { note } }
      ),
    onSuccess: (data) => invalidate(data.companyId),
  });
}

/** Reconciliação manual (Prompt 3): Admin define o valor final -> vira definitivo. */
export function useResolveConfirmation() {
  const invalidate = useInvalidateConfirmations();
  return useMutation({
    mutationFn: ({
      matchId,
      finalAmount,
      note,
    }: {
      matchId: number;
      finalAmount: number;
      note: string | null;
    }) =>
      apiFetch<AdminMatchConfirmationDTO>(
        `/api/admin/confirmations/${matchId}/resolve`,
        { method: "POST", body: { finalAmount, note } }
      ),
    onSuccess: (data) => invalidate(data.companyId),
  });
}

/** Reconciliação manual (Prompt 3): não foi possível confirmar -> sem valor, sem comissão. */
export function useMarkUnconfirmable() {
  const invalidate = useInvalidateConfirmations();
  return useMutation({
    mutationFn: ({ matchId, note }: { matchId: number; note: string | null }) =>
      apiFetch<AdminMatchConfirmationDTO>(
        `/api/admin/confirmations/${matchId}/mark-unconfirmable`,
        { method: "POST", body: { note } }
      ),
    onSuccess: (data) => invalidate(data.companyId),
  });
}

export function useSetCompanyObservation() {
  const invalidate = useInvalidateConfirmations();
  return useMutation({
    mutationFn: ({
      companyId,
      underObservation,
    }: {
      companyId: number;
      underObservation: boolean;
    }) =>
      apiFetch<AdminCompanyConfirmationOverviewDTO>(
        `/api/admin/companies/${companyId}/observation`,
        { method: "PUT", body: { underObservation } }
      ),
    onSuccess: (data) => invalidate(data.companyId),
  });
}
