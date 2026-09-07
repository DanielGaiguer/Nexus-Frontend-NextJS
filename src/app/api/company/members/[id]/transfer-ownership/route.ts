import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/company/members/[id]/transfer-ownership">
) {
  const { id } = await ctx.params;
  return proxyToBackend<{ message: string }>(
    `/api/company/members/${id}/transfer-ownership`,
    { method: "POST" }
  );
}
