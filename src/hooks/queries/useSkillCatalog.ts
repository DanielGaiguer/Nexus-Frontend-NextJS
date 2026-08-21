import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { SkillResponseDTO } from "@/types/skill";

export const skillCatalogKey = () => ["skills", "catalog"] as const;

/**
 * Catálogo de skills pra filtros usados por mais de um papel (os três
 * mapas, pro/opportunities, admin/projects) — GET /api/skills, liberado
 * pra qualquer papel autenticado (SecurityConfig: permitAll). Diferente de
 * `useProjectSkillCatalog` (GET /api/projects/skills, só COMPANY — correto
 * pra telas exclusivas de empresa como o formulário de projeto, mas
 * devolve 403 vazio pra profissional/admin).
 */
export function useSkillCatalog() {
  return useQuery({
    queryKey: skillCatalogKey(),
    queryFn: () => apiFetch<SkillResponseDTO[]>("/api/skills"),
    staleTime: 5 * 60 * 1000,
  });
}
