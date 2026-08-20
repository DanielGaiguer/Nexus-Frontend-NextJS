import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CompanyProfileDTO } from "@/types/company";

export const adminPendingCompaniesKey = () =>
  ["admin", "companies", "pending"] as const;
export const adminLatestCompaniesKey = () =>
  ["admin", "companies", "latest"] as const;
export const adminAllCompaniesKey = () =>
  ["admin", "companies", "all"] as const;

export function useAdminPendingCompanies() {
  return useQuery({
    queryKey: adminPendingCompaniesKey(),
    queryFn: () =>
      apiFetch<CompanyProfileDTO[]>("/api/admin/companies/pending"),
  });
}

export function useAdminLatestCompanies() {
  return useQuery({
    queryKey: adminLatestCompaniesKey(),
    queryFn: () => apiFetch<CompanyProfileDTO[]>("/api/admin/companies/latest"),
  });
}

/** Todas as empresas — alimenta /admin/approvals (tabs Todas/Pendentes/Aprovadas/Rejeitadas). */
export function useAdminAllCompanies() {
  return useQuery({
    queryKey: adminAllCompaniesKey(),
    queryFn: () => apiFetch<CompanyProfileDTO[]>("/api/admin/companies"),
  });
}
