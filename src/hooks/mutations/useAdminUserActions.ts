import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminUsersKey } from "@/hooks/queries/useAdminUsers";
import { apiFetch } from "@/lib/api-client";

export function useToggleUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      apiFetch<{ message: string }>(`/api/admin/users/${userId}/toggle`, {
        method: "POST",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminUsersKey() }),
  });
}
