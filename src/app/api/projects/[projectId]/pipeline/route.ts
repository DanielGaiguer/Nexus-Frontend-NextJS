import { proxyToBackend } from "@/lib/route-handlers";
import type { PipelineBoardDTO } from "@/types/pipeline";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/pipeline">
) {
  const { projectId } = await ctx.params;
  return proxyToBackend<PipelineBoardDTO>(
    `/api/projects/${projectId}/pipeline`
  );
}
