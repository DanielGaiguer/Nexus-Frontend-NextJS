import { proxyToBackend } from "@/lib/route-handlers";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/reviews/company/[companyId]/count">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<number>(`/api/reviews/company/${companyId}/count`);
}
