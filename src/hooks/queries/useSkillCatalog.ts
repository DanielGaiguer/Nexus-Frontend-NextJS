import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { SkillResponseDTO } from "@/types/skill";

export const skillCatalogKey = () => ["skills", "catalog"] as const;

/** Catálogo completo de skills cadastradas no sistema (não é "minhas skills"). */
export function useSkillCatalog() {
  return useQuery({
    queryKey: skillCatalogKey(),
    queryFn: () => apiFetch<SkillResponseDTO[]>("/api/professional/skills"),
    staleTime: 5 * 60 * 1000,
  });
}
