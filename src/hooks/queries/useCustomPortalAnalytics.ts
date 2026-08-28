import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CustomPortalAnalyticsDTO } from "@/types/custom-portal";

export type AnalyticsRange = 7 | 30 | 90;

export const customPortalAnalyticsKey = (days: number) =>
  ["company", "custom-portal", "analytics", days] as const;

/** Dashboard "Análises" da plataforma personalizada do contratante logado. */
export function useCustomPortalAnalytics(days: AnalyticsRange, enabled = true) {
  return useQuery({
    queryKey: customPortalAnalyticsKey(days),
    queryFn: () =>
      apiFetch<CustomPortalAnalyticsDTO>(
        `/api/company/custom-portal/analytics?days=${days}`
      ),
    enabled,
  });
}
