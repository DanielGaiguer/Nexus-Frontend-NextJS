import { proxyToBackend } from "@/lib/route-handlers";
import type { PreviousProjectDTO } from "@/types/previous-project";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/professional/projects/[projectId]">
) {
  const { projectId } = await ctx.params;
  const body = (await request.json()) as PreviousProjectDTO;
  return proxyToBackend<string, { message: string }>(
    `/api/professional/projects/${projectId}`,
    { method: "PUT", body, transform: (message) => ({ message }) }
  );
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/professional/projects/[projectId]">
) {
  const { projectId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/professional/projects/${projectId}`,
    { method: "DELETE", transform: (message) => ({ message }) }
  );
}
