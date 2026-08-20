import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProjectResponseDTO } from "@/types/project";

export const adminProjectsKey = () => ["admin", "projects"] as const;

export function useAdminProjects() {
  return useQuery({
    queryKey: adminProjectsKey(),
    queryFn: () => apiFetch<ProjectResponseDTO[]>("/api/admin/projects"),
  });
}
