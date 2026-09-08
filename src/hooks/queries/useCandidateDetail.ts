import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  CandidateEvaluationSummaryDTO,
  CompanyCandidateNoteDTO,
} from "@/types/candidate";

export const candidateNotesKey = (professionalId: number, matchId?: number) =>
  ["company", "candidate-notes", professionalId, matchId ?? null] as const;

/** Notas internas sobre um profissional. Sem `matchId` = todas (transparência de equipe). */
export function useCandidateNotes(
  professionalId: number | undefined,
  matchId?: number,
  enabled = true
) {
  return useQuery({
    queryKey: candidateNotesKey(professionalId ?? 0, matchId),
    queryFn: () => {
      const qs = matchId != null ? `?matchId=${matchId}` : "";
      return apiFetch<CompanyCandidateNoteDTO[]>(
        `/api/company/candidates/${professionalId}/notes${qs}`
      );
    },
    enabled: enabled && professionalId != null,
  });
}

export const candidateEvaluationsKey = (projectId: number, matchId: number) =>
  ["company", "candidate-evaluations", projectId, matchId] as const;

/** Consolidado do scorecard de um candidato: média ao vivo + lista de pareceres. */
export function useCandidateEvaluations(
  projectId: number | undefined,
  matchId: number | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: candidateEvaluationsKey(projectId ?? 0, matchId ?? 0),
    queryFn: () =>
      apiFetch<CandidateEvaluationSummaryDTO>(
        `/api/projects/${projectId}/pipeline/matches/${matchId}/evaluations`
      ),
    enabled: enabled && projectId != null && matchId != null,
  });
}
