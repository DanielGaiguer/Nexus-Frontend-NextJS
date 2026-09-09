import { proxyToBackend } from "@/lib/route-handlers";
import type {
  AssessmentTemplateRequestDTO,
  AssessmentTemplateResponseDTO,
} from "@/types/assessment-template";

// Biblioteca de testes reutilizáveis da empresa. `applicableOnly=true` esconde os aposentados --
// usado onde a pergunta é "qual teste aplicar nesta vaga"; a tela da biblioteca lista os dois.
export async function GET(request: Request) {
  const applicableOnly =
    new URL(request.url).searchParams.get("applicableOnly") === "true";
  return proxyToBackend<AssessmentTemplateResponseDTO[]>(
    `/api/assessment-templates?applicableOnly=${applicableOnly}`
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as AssessmentTemplateRequestDTO;
  return proxyToBackend<AssessmentTemplateResponseDTO>(
    "/api/assessment-templates",
    {
      method: "POST",
      body,
    }
  );
}
