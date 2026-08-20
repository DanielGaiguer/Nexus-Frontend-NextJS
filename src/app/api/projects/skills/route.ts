import { proxyToBackend } from "@/lib/route-handlers";
import type { SkillResponseDTO } from "@/types/skill";

export async function GET() {
  return proxyToBackend<SkillResponseDTO[]>("/api/projects/skills");
}
