import { proxyToBackend } from "@/lib/route-handlers";
import type { ScreeningQuestionnaireResponseDTO } from "@/types/screening";

// 1:1 com o projeto -- devolve null (200) quando a vaga ainda não tem questionário.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/screening-questionnaires/project/[projectId]">
) {
  const { projectId } = await ctx.params;
  return proxyToBackend<ScreeningQuestionnaireResponseDTO | null>(
    `/api/screening-questionnaires/project/${projectId}`
  );
}
