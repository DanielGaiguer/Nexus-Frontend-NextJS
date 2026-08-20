import { proxyToBackend } from "@/lib/route-handlers";
import type { MatchHistoryDTO } from "@/types/match";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/matches/[matchId]/history">
) {
  const { matchId } = await ctx.params;
  return proxyToBackend<MatchHistoryDTO[]>(`/api/matches/${matchId}/history`);
}
