import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProjectResponseDTO } from "@/types/project";

export const myProjectsKey = () => ["company", "projects"] as const;
export const projectKey = (id: number) => ["company", "projects", id] as const;

export function useMyProjects() {
  return useQuery({
    queryKey: myProjectsKey(),
    queryFn: () => apiFetch<ProjectResponseDTO[]>("/api/projects"),
  });
}

export function useProject(id: number | undefined) {
  return useQuery({
    queryKey: projectKey(id ?? 0),
    queryFn: () => apiFetch<ProjectResponseDTO>(`/api/projects/${id}`),
    enabled: id != null,
  });
}
