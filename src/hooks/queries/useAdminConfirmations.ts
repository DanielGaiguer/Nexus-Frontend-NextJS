import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  AdminCompanyConfirmationOverviewDTO,
  AdminConfirmationQueueItemDTO,
  AdminMatchConfirmationDTO,
} from "@/types/admin";
import type { MatchConfirmationStatus } from "@/types/match";

export const adminConfirmationQueueKey = () =>
  ["admin", "confirmations", "queue"] as const;
export const adminPendingReconciliationKey = () =>
  ["admin", "confirmations", "pending-reconciliation"] as const;
export const adminConfirmationListKey = (
  status: MatchConfirmationStatus | "ALL",
  companyId: number | null
) => ["admin", "confirmations", "list", status, companyId] as const;
export const adminCompanyConfirmationsKey = (companyId: number) =>
  ["admin", "company", companyId, "confirmations"] as const;

export function useAdminConfirmationQueue() {
  return useQuery({
    queryKey: adminConfirmationQueueKey(),
    queryFn: () =>
      apiFetch<AdminConfirmationQueueItemDTO[]>(
        "/api/admin/confirmations/queue"
      ),
  });
}

/** Casos PENDING_ADMIN_REVIEW para a tela dedicada de reconciliação (Prompt 3). */
export function useAdminPendingReconciliation() {
  return useQuery({
    queryKey: adminPendingReconciliationKey(),
    queryFn: () =>
      apiFetch<AdminMatchConfirmationDTO[]>(
        "/api/admin/confirmations/pending-reconciliation"
      ),
  });
}

export function useAdminConfirmationsList(
  status: MatchConfirmationStatus | "ALL" = "ALL",
  companyId: number | null = null
) {
  return useQuery({
    queryKey: adminConfirmationListKey(status, companyId),
    queryFn: () => {
      const qs = new URLSearchParams();
      if (status !== "ALL") qs.set("status", status);
      if (companyId != null) qs.set("companyId", String(companyId));
      const suffix = qs.toString() ? `?${qs}` : "";
      return apiFetch<AdminMatchConfirmationDTO[]>(
        `/api/admin/confirmations${suffix}`
      );
    },
  });
}

export function useAdminCompanyConfirmations(companyId: number) {
  return useQuery({
    queryKey: adminCompanyConfirmationsKey(companyId),
    queryFn: () =>
      apiFetch<AdminCompanyConfirmationOverviewDTO>(
        `/api/admin/companies/${companyId}/confirmations`
      ),
  });
}
