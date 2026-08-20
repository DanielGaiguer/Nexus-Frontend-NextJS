import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminDashboardKey } from "@/hooks/queries/useAdminDashboard";
import { adminProjectsKey } from "@/hooks/queries/useAdminProjects";
import { apiFetch } from "@/lib/api-client";

export function useCloseProjectAsAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: number) =>
      apiFetch<{ message: string }>(`/api/admin/projects/${projectId}/close`, {
        method: "PUT",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProjectsKey() });
      queryClient.invalidateQueries({ queryKey: adminDashboardKey() });
    },
  });
}
