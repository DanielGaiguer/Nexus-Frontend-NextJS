import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  AdminCustomPortalAnalyticsDTO,
  CustomPortalAnalyticsDTO,
} from "@/types/custom-portal";

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

export const adminCustomPortalSystemAnalyticsKey = (days: number) =>
  ["admin", "custom-portals", "analytics", days] as const;

/** Dashboard geral do módulo (Admin) — agregado de todas as plataformas. */
export function useAdminCustomPortalSystemAnalytics(
  days: AnalyticsRange,
  enabled = true
) {
  return useQuery({
    queryKey: adminCustomPortalSystemAnalyticsKey(days),
    queryFn: () =>
      apiFetch<AdminCustomPortalAnalyticsDTO>(
        `/api/admin/custom-portals/analytics?days=${days}`
      ),
    enabled,
  });
}

export const adminCustomPortalAnalyticsKey = (portalId: number, days: number) =>
  ["admin", "custom-portals", portalId, "analytics", days] as const;

/** Dashboard "Análises" de uma plataforma específica, visto pelo Admin. */
export function useAdminCustomPortalAnalytics(
  portalId: number,
  days: AnalyticsRange,
  enabled = true
) {
  return useQuery({
    queryKey: adminCustomPortalAnalyticsKey(portalId, days),
    queryFn: () =>
      apiFetch<CustomPortalAnalyticsDTO>(
        `/api/admin/custom-portals/${portalId}/analytics?days=${days}`
      ),
    enabled: enabled && Number.isFinite(portalId),
  });
}
