import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { MatchHistoryDTO, MatchResponseDTO } from "@/types/match";

export const matchKey = (matchId: number) => ["matches", matchId] as const;
export const matchHistoryKey = (matchId: number) =>
  ["matches", matchId, "history"] as const;

/** Match único por id, role-agnóstico — backend valida participação (GET /api/matches/{matchId}). */
export function useMatch(matchId: number) {
  return useQuery({
    queryKey: matchKey(matchId),
    queryFn: () => apiFetch<MatchResponseDTO>(`/api/matches/${matchId}`),
  });
}

/** Timeline de mudanças de status do match ("Ver histórico") — só busca quando o dialog abre. */
export function useMatchHistory(matchId: number, enabled: boolean) {
  return useQuery({
    queryKey: matchHistoryKey(matchId),
    queryFn: () =>
      apiFetch<MatchHistoryDTO[]>(`/api/matches/${matchId}/history`),
    enabled,
  });
}
