import { proxyToBackend } from "@/lib/route-handlers";

export async function PUT(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/close">
) {
  const { projectId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/projects/${projectId}/close`,
    { method: "PUT", transform: (message) => ({ message }) }
  );
}
