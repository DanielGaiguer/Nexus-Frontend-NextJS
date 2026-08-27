import { proxyToBackend } from "@/lib/route-handlers";
import type { ScreeningAttemptDTO } from "@/types/screening";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/screening-invitations/[id]/start">
) {
  const { id } = await ctx.params;
  return proxyToBackend<ScreeningAttemptDTO>(`/api/screening-invitations/${id}/start`, {
    method: "POST",
  });
}
