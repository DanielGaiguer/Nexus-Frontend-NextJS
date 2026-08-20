import { proxyToBackend } from "@/lib/route-handlers";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/admin/skills/[skillId]">
) {
  const { skillId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/admin/skills/${skillId}`,
    {
      method: "DELETE",
      transform: (message) => ({ message }),
    }
  );
}
