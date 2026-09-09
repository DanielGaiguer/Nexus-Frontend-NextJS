import { proxyToBackend } from "@/lib/route-handlers";
import type { AssessmentTemplateResponseDTO } from "@/types/assessment-template";

// Aposentar / reativar. Não existe DELETE de propósito: etapas já geradas apontam pro molde em
// ScreeningStage.sourceTemplateId, e apagar a linha deixaria esse rastro órfão.
export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/assessment-templates/[id]/active">
) {
  const { id } = await ctx.params;
  const active = new URL(request.url).searchParams.get("active") === "true";
  return proxyToBackend<AssessmentTemplateResponseDTO>(
    `/api/assessment-templates/${id}/active?active=${active}`,
    { method: "PUT" }
  );
}
