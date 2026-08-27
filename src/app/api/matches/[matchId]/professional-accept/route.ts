import { proxyToBackend } from "@/lib/route-handlers";
import type { MatchActionResponseDTO } from "@/types/match";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/matches/[matchId]/professional-accept">
) {
  const { matchId } = await ctx.params;
  return proxyToBackend<MatchActionResponseDTO>(
    `/api/matches/${matchId}/professional-accept`,
    { method: "POST" }
  );
}
