import { proxyToBackend } from "@/lib/route-handlers";
import type { ScreeningVideoPlaybackDTO } from "@/types/screening-video";

// Link assinado de curta validade. O guard (dono da tentativa OU empresa dona da vaga) roda no
// backend ANTES de qualquer coisa ser assinada.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/screening-invitations/[id]/video/[questionId]/playback">
) {
  const { id, questionId } = await ctx.params;
  return proxyToBackend<ScreeningVideoPlaybackDTO>(
    `/api/screening-invitations/${id}/video/${questionId}/playback`
  );
}
