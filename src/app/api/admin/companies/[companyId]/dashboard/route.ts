import { proxyToBackend } from "@/lib/route-handlers";
import type { CompanyDashboardDTO } from "@/types/company";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/companies/[companyId]/dashboard">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<CompanyDashboardDTO>(
    `/api/admin/companies/${companyId}/dashboard`
  );
}
