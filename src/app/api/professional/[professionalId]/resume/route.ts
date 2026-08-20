import { proxyBinary } from "@/lib/route-handlers";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/professional/[professionalId]/resume">
) {
  const { professionalId } = await ctx.params;
  return proxyBinary(
    `/api/professional/${professionalId}/resume`,
    "application/pdf"
  );
}
