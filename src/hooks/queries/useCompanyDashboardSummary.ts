import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CompanyDashboardDTO } from "@/types/company";

export const companyDashboardSummaryKey = () =>
  ["company", "dashboard", "summary"] as const;

/** /api/company/dashboard — totais simples (CompanyDashboardDTO), diferente do dashboard analítico (useCompanyDashboard). */
export function useCompanyDashboardSummary() {
  return useQuery({
    queryKey: companyDashboardSummaryKey(),
    queryFn: () => apiFetch<CompanyDashboardDTO>("/api/company/dashboard"),
  });
}
