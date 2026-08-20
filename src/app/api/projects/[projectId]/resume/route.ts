import { proxyToBackend } from "@/lib/route-handlers";
import type { ProjectResponseDTO } from "@/types/project";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/resume">
) {
  const { projectId } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<ProjectResponseDTO>(
    `/api/projects/${projectId}/resume${qs ? `?${qs}` : ""}`,
    { method: "PUT" }
  );
}
