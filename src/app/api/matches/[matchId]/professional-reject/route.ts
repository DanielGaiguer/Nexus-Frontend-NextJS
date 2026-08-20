import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalRejectRequestDTO } from "@/types/match";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/matches/[matchId]/professional-reject">
) {
  const { matchId } = await ctx.params;
  const body = (await request.json()) as ProfessionalRejectRequestDTO;
  return proxyToBackend<string, { message: string }>(
    `/api/matches/${matchId}/professional-reject`,
    { method: "POST", body, transform: (message) => ({ message }) }
  );
}
