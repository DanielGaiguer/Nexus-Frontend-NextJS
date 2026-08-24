import { proxyToBackend } from "@/lib/route-handlers";
import type { ReviewDisplayDTO } from "@/types/review";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/reviews/company/[companyId]/top5">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<ReviewDisplayDTO[]>(
    `/api/reviews/company/${companyId}/top3?size=5`
  );
}
