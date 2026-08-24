import { proxyToBackend } from "@/lib/route-handlers";
import type { ReviewDisplayDTO } from "@/types/review";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/reviews/professional/[professionalId]/top5">
) {
  const { professionalId } = await ctx.params;
  return proxyToBackend<ReviewDisplayDTO[]>(
    `/api/reviews/professional/${professionalId}/top3?size=5`
  );
}
