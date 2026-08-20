import { proxyToBackend } from "@/lib/route-handlers";
import type { ProjectRequestDTO, ProjectResponseDTO } from "@/types/project";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">
) {
  const { projectId } = await ctx.params;
  return proxyToBackend<ProjectResponseDTO>(`/api/projects/${projectId}`);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">
) {
  const { projectId } = await ctx.params;
  const body = (await request.json()) as ProjectRequestDTO;
  return proxyToBackend<ProjectResponseDTO>(`/api/projects/${projectId}`, {
    method: "PUT",
    body,
  });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">
) {
  const { projectId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/projects/${projectId}`,
    {
      method: "DELETE",
      transform: (message) => ({ message }),
    }
  );
}
