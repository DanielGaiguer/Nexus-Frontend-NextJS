import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CompanyDashboardDTO, CompanyProfileDTO } from "@/types/company";
import type { MatchResponseDTO } from "@/types/match";
import type { ProjectResponseDTO } from "@/types/project";

export const adminCompanyProfileKey = (id: number) =>
  ["admin", "company", id, "profile"] as const;
export const adminCompanyDashboardKey = (id: number) =>
  ["admin", "company", id, "dashboard"] as const;
export const adminCompanyProjectsKey = (id: number) =>
  ["admin", "company", id, "projects"] as const;
export const adminCompanyMatchesKey = (id: number) =>
  ["admin", "company", id, "matches"] as const;

export function useAdminCompanyProfile(id: number) {
  return useQuery({
    queryKey: adminCompanyProfileKey(id),
    queryFn: () =>
      apiFetch<CompanyProfileDTO>(`/api/admin/companies/${id}/profile`),
  });
}

export function useAdminCompanyDashboard(id: number) {
  return useQuery({
    queryKey: adminCompanyDashboardKey(id),
    queryFn: () =>
      apiFetch<CompanyDashboardDTO>(`/api/admin/companies/${id}/dashboard`),
  });
}

export function useAdminCompanyProjects(id: number) {
  return useQuery({
    queryKey: adminCompanyProjectsKey(id),
    queryFn: () =>
      apiFetch<ProjectResponseDTO[]>(`/api/admin/companies/${id}/projects`),
  });
}

export function useAdminCompanyMatches(id: number) {
  return useQuery({
    queryKey: adminCompanyMatchesKey(id),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>(`/api/admin/companies/${id}/matches`),
  });
}
