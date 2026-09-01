import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ContractorCommissionStatusDTO } from "@/types/commission";

export const commissionStatusKey = () =>
  ["company", "commission-status"] as const;

export function useCommissionStatus() {
  return useQuery({
    queryKey: commissionStatusKey(),
    queryFn: () =>
      apiFetch<ContractorCommissionStatusDTO>("/api/company/commission-status"),
  });
}
