import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";

export const matchKey = (matchId: number) => ["matches", matchId] as const;

/** Match único por id, role-agnóstico — backend valida participação (GET /api/matches/{matchId}). */
export function useMatch(matchId: number) {
  return useQuery({
    queryKey: matchKey(matchId),
    queryFn: () => apiFetch<MatchResponseDTO>(`/api/matches/${matchId}`),
  });
}
