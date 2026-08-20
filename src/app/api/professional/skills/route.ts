import { proxyToBackend } from "@/lib/route-handlers";
import type { SkillResponseDTO } from "@/types/skill";

/** Catálogo completo de skills (não é "minhas skills" — ver ProfessionalController#listSkills). */
export async function GET() {
  return proxyToBackend<SkillResponseDTO[]>("/api/professional/skills");
}

export async function PUT(request: Request) {
  const skillIds = (await request.json()) as number[];
  return proxyToBackend<string, { message: string }>(
    "/api/professional/skills",
    {
      method: "PUT",
      body: skillIds,
      transform: (message) => ({ message }),
    }
  );
}
