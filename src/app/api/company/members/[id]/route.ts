import { proxyToBackend } from "@/lib/route-handlers";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/company/members/[id]">
) {
  const { id } = await ctx.params;
  return proxyToBackend<{ message: string }>(`/api/company/members/${id}`, {
    method: "DELETE",
  });
}
