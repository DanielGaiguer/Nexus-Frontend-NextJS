import { proxyToBackend } from "@/lib/route-handlers";
import type { CompanyDashboardAnalyticsDTO } from "@/types/analytics";

/** Só admin (ver CompanyAnalyticsController#getDashboardByAdmin no backend). */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/analytics/company/[companyId]/dashboard">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<CompanyDashboardAnalyticsDTO>(
    `/api/analytics/company/${companyId}/dashboard`
  );
}
