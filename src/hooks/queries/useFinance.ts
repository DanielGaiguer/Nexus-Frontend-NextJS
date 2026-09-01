import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  AdminFinanceOverviewDTO,
  ContractorFinanceOverviewDTO,
} from "@/types/finance";

export const contractorFinanceKey = () => ["company", "finance"] as const;
export const adminFinanceKey = () => ["admin", "finance"] as const;

/** Extrato consolidado do contratante (Prompt 7). */
export function useContractorFinanceOverview(enabled = true) {
  return useQuery({
    queryKey: contractorFinanceKey(),
    queryFn: () =>
      apiFetch<ContractorFinanceOverviewDTO>("/api/company/finance/overview"),
    enabled,
    refetchInterval: 60 * 1000,
  });
}

/** Visão geral de receita de comissão do Admin (Prompt 7). */
export function useAdminFinanceOverview() {
  return useQuery({
    queryKey: adminFinanceKey(),
    queryFn: () =>
      apiFetch<AdminFinanceOverviewDTO>("/api/admin/finance/overview"),
    refetchInterval: 60 * 1000,
  });
}
