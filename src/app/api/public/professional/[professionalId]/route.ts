import { proxyToBackend } from "@/lib/route-handlers";
import type { PublicProfessionalDTO } from "@/types/public";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/public/professional/[professionalId]">
) {
  const { professionalId } = await ctx.params;
  return proxyToBackend<PublicProfessionalDTO>(
    `/api/public/professional/${professionalId}`,
    { requireAuth: false }
  );
}
