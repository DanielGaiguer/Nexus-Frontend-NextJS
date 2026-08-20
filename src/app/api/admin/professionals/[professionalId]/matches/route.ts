import { proxyToBackend } from "@/lib/route-handlers";
import type { MatchResponseDTO } from "@/types/match";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/professionals/[professionalId]/matches">
) {
  const { professionalId } = await ctx.params;
  return proxyToBackend<MatchResponseDTO[]>(
    `/api/admin/professionals/${professionalId}/matches`
  );
}
