import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { BillingModeDTO } from "@/types/billing";
import type {
  PortalSubscriptionChargeDTO,
  PortalSubscriptionStatusDTO,
} from "@/types/custom-portal";

export const portalSubscriptionKey = () =>
  ["company", "custom-portal", "subscription"] as const;
export const portalSubscriptionChargesKey = () =>
  ["company", "custom-portal", "subscription", "charges"] as const;
export const adminPortalChargesKey = (status: string) =>
  ["admin", "portal-subscription-charges", status] as const;
export const adminPortalChargeModeKey = () =>
  ["admin", "portal-subscription-charges", "mode"] as const;

/** Situação da assinatura da plataforma do contratante logado. */
export function usePortalSubscription(enabled = true) {
  return useQuery({
    queryKey: portalSubscriptionKey(),
    queryFn: () =>
      apiFetch<PortalSubscriptionStatusDTO>(
        "/api/company/custom-portal/subscription"
      ),
    enabled,
    // suspensão/reativação podem vir por webhook/job -- revalida de vez em quando.
    refetchInterval: 60 * 1000,
  });
}

export function usePortalSubscriptionCharges(enabled = true) {
  return useQuery({
    queryKey: portalSubscriptionChargesKey(),
    queryFn: () =>
      apiFetch<PortalSubscriptionChargeDTO[]>(
        "/api/company/custom-portal/subscription/charges"
      ),
    enabled,
  });
}

export function useAdminPortalCharges(status = "ALL") {
  return useQuery({
    queryKey: adminPortalChargesKey(status),
    queryFn: () => {
      const qs = status !== "ALL" ? `?status=${status}` : "";
      return apiFetch<PortalSubscriptionChargeDTO[]>(
        `/api/admin/portal-subscription-charges${qs}`
      );
    },
    refetchInterval: 30 * 1000,
  });
}

/** Se a simulação de cobrança está disponível (modo simulate, sem Mercado Pago). */
export function useAdminPortalChargeMode() {
  return useQuery({
    queryKey: adminPortalChargeModeKey(),
    queryFn: () =>
      apiFetch<BillingModeDTO>("/api/admin/portal-subscription-charges/mode"),
    staleTime: 5 * 60 * 1000,
  });
}
