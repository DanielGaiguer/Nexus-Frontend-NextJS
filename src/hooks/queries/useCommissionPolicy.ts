import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CommissionPolicyDTO } from "@/types/commission";

export const commissionPolicyKey = () =>
  ["admin", "commission-policy"] as const;

export function useCommissionPolicy() {
  return useQuery({
    queryKey: commissionPolicyKey(),
    queryFn: () =>
      apiFetch<CommissionPolicyDTO>("/api/admin/commission-policy"),
  });
}
