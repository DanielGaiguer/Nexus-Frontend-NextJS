import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProfessionalDashboardAnalyticsDTO } from "@/types/analytics";

export const professionalDashboardKey = () =>
  ["professional", "dashboard", "analytics"] as const;

export function useProfessionalDashboard() {
  return useQuery({
    queryKey: professionalDashboardKey(),
    queryFn: () =>
      apiFetch<ProfessionalDashboardAnalyticsDTO>(
        "/api/analytics/professional/dashboard"
      ),
  });
}
