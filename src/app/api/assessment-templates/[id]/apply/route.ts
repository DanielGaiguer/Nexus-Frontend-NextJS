import { proxyToBackend } from "@/lib/route-handlers";
import type { ApplyAssessmentTemplateRequestDTO } from "@/types/assessment-template";
import type { ScreeningStageResponseDTO } from "@/types/screening";

// Aplica o molde direto numa vaga, criando a etapa no banco na hora.
//
// Não é o caminho usado DENTRO do formulário da vaga: lá a cópia acontece no client e só vira
// etapa quando o formulário é salvo (ver ApplyTemplateButton). Chamar isto no meio de uma edição
// criaria a etapa no banco enquanto o formulário ainda segura o estado antigo -- e o save
// seguinte, sem ela na lista, a desativaria.
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/assessment-templates/[id]/apply">
) {
  const { id } = await ctx.params;
  const body = (await request.json()) as ApplyAssessmentTemplateRequestDTO;
  return proxyToBackend<ScreeningStageResponseDTO>(
    `/api/assessment-templates/${id}/apply`,
    { method: "POST", body }
  );
}
