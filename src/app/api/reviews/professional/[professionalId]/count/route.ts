import { proxyToBackend } from "@/lib/route-handlers";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/reviews/professional/[professionalId]/count">
) {
  const { professionalId } = await ctx.params;
  return proxyToBackend<number>(
    `/api/reviews/professional/${professionalId}/count`
  );
}
