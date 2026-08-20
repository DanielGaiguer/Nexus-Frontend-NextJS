import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/matches/[matchId]/company-cancel">
) {
  const { matchId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/matches/${matchId}/company-cancel`,
    { method: "POST", transform: (message) => ({ message }) }
  );
}
