import { proxyToBackend } from "@/lib/route-handlers";
import type {
  MovePipelineCardRequestDTO,
  PipelineCardDTO,
} from "@/types/pipeline";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/pipeline/matches/[matchId]/stage">
) {
  const { projectId, matchId } = await ctx.params;
  const body = (await request.json()) as MovePipelineCardRequestDTO;
  return proxyToBackend<PipelineCardDTO>(
    `/api/projects/${projectId}/pipeline/matches/${matchId}/stage`,
    { method: "PUT", body }
  );
}
