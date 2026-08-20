import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";

export interface RankingFilters {
  city?: string;
  uf?: string;
  experienceLevel?: string;
  available?: boolean;
  minSalary?: number;
  maxSalary?: number;
  skill?: string;
}

export const projectRankingKey = (id: number, filters: RankingFilters) =>
  ["company", "projects", id, "ranking", filters] as const;

export function useProjectRanking(
  id: number | undefined,
  filters: RankingFilters = {}
) {
  return useQuery({
    queryKey: projectRankingKey(id ?? 0, filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.city) params.set("city", filters.city);
      if (filters.uf) params.set("uf", filters.uf);
      if (filters.experienceLevel)
        params.set("experienceLevel", filters.experienceLevel);
      if (filters.available != null)
        params.set("available", String(filters.available));
      if (filters.minSalary != null)
        params.set("minSalary", String(filters.minSalary));
      if (filters.maxSalary != null)
        params.set("maxSalary", String(filters.maxSalary));
      if (filters.skill) params.set("skill", filters.skill);
      const qs = params.toString();
      return apiFetch<MatchResponseDTO[]>(
        `/api/projects/${id}/ranking${qs ? `?${qs}` : ""}`
      );
    },
    enabled: id != null,
  });
}
