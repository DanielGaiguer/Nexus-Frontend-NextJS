import { proxyToBackend } from "@/lib/route-handlers";
import type {
  ScreeningInvitationDetailDTO,
  ScreeningStageDecisionRequestDTO,
} from "@/types/screening";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/screening-invitations/[id]/reprove">
) {
  const { id } = await ctx.params;
  const body = (await request.json()) as ScreeningStageDecisionRequestDTO;
  return proxyToBackend<ScreeningInvitationDetailDTO>(
    `/api/screening-invitations/${id}/reprove`,
    { method: "POST", body }
  );
}
