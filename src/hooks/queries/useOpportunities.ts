import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";

export const opportunitiesKey = () =>
  ["professional", "opportunities"] as const;

/** Vagas/projetos compatíveis com o profissional — matches ainda em WAITING. */
export function useOpportunities() {
  return useQuery({
    queryKey: opportunitiesKey(),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>("/api/professional/opportunities"),
  });
}
