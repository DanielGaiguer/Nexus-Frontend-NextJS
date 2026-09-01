import { useMutation, useQueryClient } from "@tanstack/react-query";

import { commissionPolicyKey } from "@/hooks/queries/useCommissionPolicy";
import { apiFetch } from "@/lib/api-client";
import type {
  CommissionPolicyDTO,
  UpdateCommissionPolicyBody,
} from "@/types/commission";

export function useUpdateCommissionPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCommissionPolicyBody) =>
      apiFetch<CommissionPolicyDTO>("/api/admin/commission-policy", {
        method: "PUT",
        body,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: commissionPolicyKey() }),
  });
}
