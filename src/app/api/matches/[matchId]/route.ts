import { proxyToBackend } from "@/lib/route-handlers";
import type { MatchResponseDTO } from "@/types/match";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/matches/[matchId]">
) {
  const { matchId } = await ctx.params;
  return proxyToBackend<MatchResponseDTO>(`/api/matches/${matchId}`);
}
