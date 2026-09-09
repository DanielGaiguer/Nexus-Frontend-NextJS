import { proxyToBackend } from "@/lib/route-handlers";
import type { ScreeningVideoUploadTicketDTO } from "@/types/screening-video";

// O backend só ASSINA -- o arquivo vai do browser direto pro Supabase, sem atravessar este
// Route Handler nem o Spring (evita o duplo buffer em memória que os outros uploads do sistema
// têm, e que com 50MB de vídeo derrubaria o backend).
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/screening-invitations/[id]/video/upload-url">
) {
  const { id } = await ctx.params;
  const params = new URL(request.url).searchParams;
  const questionId = params.get("questionId") ?? "";
  const contentType = params.get("contentType") ?? "";

  return proxyToBackend<ScreeningVideoUploadTicketDTO>(
    `/api/screening-invitations/${id}/video/upload-url` +
      `?questionId=${encodeURIComponent(questionId)}` +
      `&contentType=${encodeURIComponent(contentType)}`,
    { method: "POST" }
  );
}
