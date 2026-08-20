import { proxyToBackend } from "@/lib/route-handlers";
import type { ReviewPageDTO } from "@/types/review";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/reviews/professional/[professionalId]/all">
) {
  const { professionalId } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<ReviewPageDTO>(
    `/api/reviews/professional/${professionalId}/all${qs ? `?${qs}` : ""}`
  );
}
