import { proxyToBackend } from "@/lib/route-handlers";
import type {
  PipelineStageDTO,
  PipelineStagesRequestDTO,
} from "@/types/pipeline";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/pipeline/stages">
) {
  const { projectId } = await ctx.params;
  return proxyToBackend<PipelineStageDTO[]>(
    `/api/projects/${projectId}/pipeline/stages`
  );
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/pipeline/stages">
) {
  const { projectId } = await ctx.params;
  const body = (await request.json()) as PipelineStagesRequestDTO;
  return proxyToBackend<PipelineStageDTO[]>(
    `/api/projects/${projectId}/pipeline/stages`,
    { method: "PUT", body }
  );
}
