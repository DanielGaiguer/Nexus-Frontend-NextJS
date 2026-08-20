import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/professional/opportunities/[projectId]/interest">
) {
  const { projectId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/professional/opportunities/${projectId}/interest`,
    { method: "POST", transform: (message) => ({ message }) }
  );
}
