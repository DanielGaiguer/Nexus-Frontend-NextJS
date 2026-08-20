import { proxyToBackend } from "@/lib/route-handlers";
import type { CompanyRejectRequestDTO } from "@/types/match";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/matches/[matchId]/company-reject">
) {
  const { matchId } = await ctx.params;
  const body = (await request.json()) as CompanyRejectRequestDTO;
  return proxyToBackend<string, { message: string }>(
    `/api/matches/${matchId}/company-reject`,
    { method: "POST", body, transform: (message) => ({ message }) }
  );
}
