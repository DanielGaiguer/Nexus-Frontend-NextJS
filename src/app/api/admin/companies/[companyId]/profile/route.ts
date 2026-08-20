import { proxyToBackend } from "@/lib/route-handlers";
import type { CompanyProfileDTO } from "@/types/company";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/companies/[companyId]/profile">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<CompanyProfileDTO>(
    `/api/admin/companies/${companyId}/profile`
  );
}
