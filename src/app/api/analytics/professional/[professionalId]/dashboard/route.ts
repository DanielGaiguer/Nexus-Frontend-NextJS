import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalDashboardAnalyticsDTO } from "@/types/analytics";

/** Só admin (ver ProfessionalAnalyticsController#getDashboardByAdmin no backend). */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/analytics/professional/[professionalId]/dashboard">
) {
  const { professionalId } = await ctx.params;
  return proxyToBackend<ProfessionalDashboardAnalyticsDTO>(
    `/api/analytics/professional/${professionalId}/dashboard`
  );
}
