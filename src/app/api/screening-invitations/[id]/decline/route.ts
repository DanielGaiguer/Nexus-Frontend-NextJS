import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/screening-invitations/[id]/decline">
) {
  const { id } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/screening-invitations/${id}/decline`,
    { method: "POST", transform: (message) => ({ message }) }
  );
}
