import { proxyToBackend } from "@/lib/route-handlers";
import type {
  ScreeningQuestionnaireRequestDTO,
  ScreeningQuestionnaireResponseDTO,
} from "@/types/screening";

export async function POST(request: Request) {
  const body = (await request.json()) as ScreeningQuestionnaireRequestDTO;
  return proxyToBackend<ScreeningQuestionnaireResponseDTO>("/api/screening-questionnaires", {
    method: "POST",
    body,
  });
}
