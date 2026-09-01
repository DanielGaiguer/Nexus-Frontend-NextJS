import { proxyToBackend } from "@/lib/route-handlers";
import type { MatchConfirmationDTO } from "@/types/match";
import type { MatchStatusCheckRequestDTO } from "@/types/review";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/matches/[matchId]/status-check">
) {
  const { matchId } = await ctx.params;
  const body = (await request.json()) as MatchStatusCheckRequestDTO;
  return proxyToBackend<MatchConfirmationDTO>(
    `/api/matches/${matchId}/status-check`,
    { method: "POST", body }
  );
}
