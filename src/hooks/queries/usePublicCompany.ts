import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { PublicCompanyDTO } from "@/types/company";
import type { ProjectResponseDTO } from "@/types/project";

export const publicCompanyKey = (id: number) =>
  ["public", "company", id] as const;
export const companyOpenProjectsKey = (id: number) =>
  ["public", "company", id, "projects", "open"] as const;
export const companyClosedProjectsKey = (id: number) =>
  ["public", "company", id, "projects", "closed"] as const;

export function usePublicCompany(id: number | undefined) {
  return useQuery({
    queryKey: publicCompanyKey(id ?? 0),
    queryFn: () => apiFetch<PublicCompanyDTO>(`/api/public/company/${id}`),
    enabled: id != null,
  });
}

export function useCompanyOpenProjects(id: number | undefined) {
  return useQuery({
    queryKey: companyOpenProjectsKey(id ?? 0),
    queryFn: () =>
      apiFetch<ProjectResponseDTO[]>(`/api/public/company/${id}/projects`),
    enabled: id != null,
  });
}

export function useCompanyClosedProjects(id: number | undefined) {
  return useQuery({
    queryKey: companyClosedProjectsKey(id ?? 0),
    queryFn: () =>
      apiFetch<ProjectResponseDTO[]>(
        `/api/public/company/${id}/projects/closed`
      ),
    enabled: id != null,
  });
}
