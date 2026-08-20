import { proxyToBackend } from "@/lib/route-handlers";
import type { MatchResponseDTO } from "@/types/match";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/ranking">
) {
  const { projectId } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<MatchResponseDTO[]>(
    `/api/projects/${projectId}/ranking${qs ? `?${qs}` : ""}`
  );
}
