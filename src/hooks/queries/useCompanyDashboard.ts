import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CompanyDashboardAnalyticsDTO } from "@/types/analytics";

export const companyDashboardKey = () =>
  ["company", "dashboard", "analytics"] as const;

export function useCompanyDashboard() {
  return useQuery({
    queryKey: companyDashboardKey(),
    queryFn: () =>
      apiFetch<CompanyDashboardAnalyticsDTO>(
        "/api/analytics/company/dashboard"
      ),
  });
}
