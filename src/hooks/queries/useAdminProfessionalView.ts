import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProfessionalDashboardDTO } from "@/types/admin";
import type { MatchResponseDTO } from "@/types/match";
import type { PreviousProjectDTO } from "@/types/previous-project";
import type { ProfessionalProfileDTO } from "@/types/professional";

export const adminProfessionalProfileKey = (id: number) =>
  ["admin", "professional", id, "profile"] as const;
export const adminProfessionalDashboardKey = (id: number) =>
  ["admin", "professional", id, "dashboard"] as const;
export const adminProfessionalMatchesKey = (id: number) =>
  ["admin", "professional", id, "matches"] as const;
export const adminProfessionalProjectsKey = (id: number) =>
  ["admin", "professional", id, "projects"] as const;

export function useAdminProfessionalProfile(id: number) {
  return useQuery({
    queryKey: adminProfessionalProfileKey(id),
    queryFn: () =>
      apiFetch<ProfessionalProfileDTO>(
        `/api/admin/professionals/${id}/profile`
      ),
  });
}

export function useAdminProfessionalDashboard(id: number) {
  return useQuery({
    queryKey: adminProfessionalDashboardKey(id),
    queryFn: () =>
      apiFetch<ProfessionalDashboardDTO>(
        `/api/admin/professionals/${id}/dashboard`
      ),
  });
}

export function useAdminProfessionalMatches(id: number) {
  return useQuery({
    queryKey: adminProfessionalMatchesKey(id),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>(`/api/admin/professionals/${id}/matches`),
  });
}

export function useAdminProfessionalProjects(id: number) {
  return useQuery({
    queryKey: adminProfessionalProjectsKey(id),
    queryFn: () =>
      apiFetch<PreviousProjectDTO[]>(`/api/admin/professionals/${id}/projects`),
  });
}
