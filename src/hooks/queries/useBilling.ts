import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  BillingConfigDTO,
  BillingModeDTO,
  BillingStatusDTO,
  CommissionChargeDTO,
} from "@/types/billing";

export const billingConfigKey = () => ["company", "billing", "config"] as const;
export const billingStatusKey = () => ["company", "billing", "status"] as const;
export const billingChargesKey = () =>
  ["company", "billing", "charges"] as const;
export const adminChargesKey = (status: string) =>
  ["admin", "commission-charges", status] as const;
export const adminBillingModeKey = () =>
  ["admin", "commission-charges", "mode"] as const;

export function useBillingConfig() {
  return useQuery({
    queryKey: billingConfigKey(),
    queryFn: () => apiFetch<BillingConfigDTO>("/api/company/billing/config"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBillingStatus(enabled = true) {
  return useQuery({
    queryKey: billingStatusKey(),
    queryFn: () => apiFetch<BillingStatusDTO>("/api/company/billing/status"),
    enabled,
    // O bloqueio/desbloqueio pode mudar por webhook/job -- revalida de vez em
    // quando. Fica montado em toda tela de empresa (BillingBlockBanner), então
    // 5min em vez de 1min corta ruído sem atrasar nada que o usuário perceba.
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useBillingCharges() {
  return useQuery({
    queryKey: billingChargesKey(),
    queryFn: () =>
      apiFetch<CommissionChargeDTO[]>("/api/company/billing/charges"),
  });
}

export function useAdminCommissionCharges(status = "ALL") {
  return useQuery({
    queryKey: adminChargesKey(status),
    queryFn: () => {
      const qs = status !== "ALL" ? `?status=${status}` : "";
      return apiFetch<CommissionChargeDTO[]>(
        `/api/admin/commission-charges${qs}`
      );
    },
    refetchInterval: 30 * 1000,
  });
}

/** Se a simulação de cobrança está disponível (modo simulate, sem Mercado Pago). */
export function useAdminBillingMode() {
  return useQuery({
    queryKey: adminBillingModeKey(),
    queryFn: () =>
      apiFetch<BillingModeDTO>("/api/admin/commission-charges/mode"),
    staleTime: 5 * 60 * 1000,
  });
}
