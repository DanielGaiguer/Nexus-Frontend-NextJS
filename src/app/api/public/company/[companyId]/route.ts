import { proxyToBackend } from "@/lib/route-handlers";
import type { PublicCompanyDTO } from "@/types/company";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/public/company/[companyId]">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<PublicCompanyDTO>(`/api/public/company/${companyId}`, {
    requireAuth: false,
  });
}
