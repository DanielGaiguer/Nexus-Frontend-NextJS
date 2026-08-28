import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";

export const opportunitiesKey = () =>
  ["professional", "opportunities"] as const;

/**
 * Vagas/projetos compatíveis com o profissional — matches ainda em WAITING.
 * `enabled` (default true) permite pular a chamada quando quem está na tela
 * não é um profissional (ex.: página pública do portal antes do login).
 */
export function useOpportunities(enabled = true) {
  return useQuery({
    queryKey: opportunitiesKey(),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>("/api/professional/opportunities"),
    enabled,
  });
}
