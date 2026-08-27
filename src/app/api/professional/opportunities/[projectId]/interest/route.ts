import { proxyToBackend } from "@/lib/route-handlers";
import type { MatchActionResponseDTO } from "@/types/match";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/professional/opportunities/[projectId]/interest">
) {
  const { projectId } = await ctx.params;
  return proxyToBackend<MatchActionResponseDTO>(
    `/api/professional/opportunities/${projectId}/interest`,
    { method: "POST" }
  );
}
