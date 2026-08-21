import { proxyToBackend } from "@/lib/route-handlers";
import type { SkillResponseDTO } from "@/types/skill";

/**
 * Catálogo de skills de uso geral (SkillController#listSkills,
 * `GET /api/skills`, `permitAll()` no SecurityConfig) — ao contrário de
 * `/api/projects/skills` (só COMPANY) ou `/api/admin/skills` (só ADMIN),
 * este funciona pra qualquer papel. Usado nos filtros de skills que
 * aparecem em telas de mais de um papel (os três mapas, pro/opportunities,
 * admin/projects) — ver useSkillCatalog.
 */
export async function GET() {
  return proxyToBackend<SkillResponseDTO[]>("/api/skills");
}
