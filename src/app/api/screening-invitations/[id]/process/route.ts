import { proxyToBackend } from "@/lib/route-handlers";
import type { ScreeningInvitationDetailDTO } from "@/types/screening";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/screening-invitations/[id]/process">
) {
  const { id } = await ctx.params;
  return proxyToBackend<ScreeningInvitationDetailDTO[]>(
    `/api/screening-invitations/${id}/process`
  );
}
