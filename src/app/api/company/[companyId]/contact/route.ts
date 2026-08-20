import { proxyToBackend } from "@/lib/route-handlers";
import type { ContactInfoDTO } from "@/types/match";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/company/[companyId]/contact">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<ContactInfoDTO>(`/api/company/${companyId}/contact`);
}
