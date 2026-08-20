import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  CompanyDashboardAnalyticsDTO,
  ProfessionalDashboardAnalyticsDTO,
} from "@/types/analytics";

export const adminProfessionalAnalyticsKey = (id: number) =>
  ["admin", "professional", id, "analytics"] as const;
export const adminCompanyAnalyticsKey = (id: number) =>
  ["admin", "company", id, "analytics"] as const;

export function useAdminProfessionalAnalytics(id: number) {
  return useQuery({
    queryKey: adminProfessionalAnalyticsKey(id),
    queryFn: () =>
      apiFetch<ProfessionalDashboardAnalyticsDTO>(
        `/api/analytics/professional/${id}/dashboard`
      ),
  });
}

export function useAdminCompanyAnalytics(id: number) {
  return useQuery({
    queryKey: adminCompanyAnalyticsKey(id),
    queryFn: () =>
      apiFetch<CompanyDashboardAnalyticsDTO>(
        `/api/analytics/company/${id}/dashboard`
      ),
  });
}
