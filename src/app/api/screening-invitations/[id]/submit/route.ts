import { proxyToBackend } from "@/lib/route-handlers";
import type {
  ScreeningInvitationDetailDTO,
  ScreeningSubmissionRequestDTO,
} from "@/types/screening";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/screening-invitations/[id]/submit">
) {
  const { id } = await ctx.params;
  const body = (await request.json()) as ScreeningSubmissionRequestDTO;
  return proxyToBackend<ScreeningInvitationDetailDTO>(
    `/api/screening-invitations/${id}/submit`,
    { method: "POST", body }
  );
}
