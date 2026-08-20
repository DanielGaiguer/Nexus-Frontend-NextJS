import { proxyToBackend } from "@/lib/route-handlers";
import type { ContactInfoDTO } from "@/types/match";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/professional/[professionalId]/contact">
) {
  const { professionalId } = await ctx.params;
  return proxyToBackend<ContactInfoDTO>(
    `/api/professional/${professionalId}/contact`
  );
}
