import { proxyToBackend } from "@/lib/route-handlers";
import type {
  ScreeningQuestionnaireRequestDTO,
  ScreeningQuestionnaireResponseDTO,
} from "@/types/screening";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/screening-questionnaires/[id]">
) {
  const { id } = await ctx.params;
  return proxyToBackend<ScreeningQuestionnaireResponseDTO>(
    `/api/screening-questionnaires/${id}`
  );
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/screening-questionnaires/[id]">
) {
  const { id } = await ctx.params;
  const body = (await request.json()) as ScreeningQuestionnaireRequestDTO;
  return proxyToBackend<ScreeningQuestionnaireResponseDTO>(
    `/api/screening-questionnaires/${id}`,
    { method: "PUT", body }
  );
}
