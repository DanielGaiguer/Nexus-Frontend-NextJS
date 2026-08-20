import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { SkillResponseDTO } from "@/types/skill";

export const projectSkillCatalogKey = () =>
  ["skills", "catalog", "projects"] as const;

export function useProjectSkillCatalog() {
  return useQuery({
    queryKey: projectSkillCatalogKey(),
    queryFn: () => apiFetch<SkillResponseDTO[]>("/api/projects/skills"),
    staleTime: 5 * 60 * 1000,
  });
}
