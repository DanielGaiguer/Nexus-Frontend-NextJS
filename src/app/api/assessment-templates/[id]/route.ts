import { proxyToBackend } from "@/lib/route-handlers";
import type {
  AssessmentTemplateRequestDTO,
  AssessmentTemplateResponseDTO,
} from "@/types/assessment-template";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/assessment-templates/[id]">
) {
  const { id } = await ctx.params;
  return proxyToBackend<AssessmentTemplateResponseDTO>(
    `/api/assessment-templates/${id}`
  );
}

// Editar substitui a lista de questões inteira. Não afeta etapas já geradas a partir deste
// molde: elas são cópias autônomas (ver AssessmentTemplateService.applyToProject).
export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/assessment-templates/[id]">
) {
  const { id } = await ctx.params;
  const body = (await request.json()) as AssessmentTemplateRequestDTO;
  return proxyToBackend<AssessmentTemplateResponseDTO>(
    `/api/assessment-templates/${id}`,
    { method: "PUT", body }
  );
}
