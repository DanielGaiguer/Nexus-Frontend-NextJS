import { useMutation, useQueryClient } from "@tanstack/react-query";

import { candidateEvaluationsKey } from "@/hooks/queries/useCandidateDetail";
import { pipelineBoardKey } from "@/hooks/queries/usePipelineBoard";
import { apiFetch } from "@/lib/api-client";
import type {
  CandidateEvaluationItemDTO,
  CandidateEvaluationRequestDTO,
  CompanyCandidateNoteDTO,
  CompanyCandidateNoteRequestDTO,
  CompanyCandidateNoteUpdateDTO,
} from "@/types/candidate";

// Invalida TODAS as variações de nota deste profissional (com/sem filtro de matchId) --
// prefix match do TanStack Query.
function useInvalidateNotes(professionalId: number) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ["company", "candidate-notes", professionalId],
    });
}

export function useCreateCandidateNote(professionalId: number) {
  const invalidate = useInvalidateNotes(professionalId);
  return useMutation({
    mutationFn: (body: CompanyCandidateNoteRequestDTO) =>
      apiFetch<CompanyCandidateNoteDTO>(
        `/api/company/candidates/${professionalId}/notes`,
        { method: "POST", body }
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateCandidateNote(professionalId: number) {
  const invalidate = useInvalidateNotes(professionalId);
  return useMutation({
    mutationFn: ({ noteId, body }: { noteId: number; body: string }) =>
      apiFetch<CompanyCandidateNoteDTO>(
        `/api/company/candidates/${professionalId}/notes/${noteId}`,
        {
          method: "PUT",
          body: { body } satisfies CompanyCandidateNoteUpdateDTO,
        }
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteCandidateNote(professionalId: number) {
  const invalidate = useInvalidateNotes(professionalId);
  return useMutation({
    mutationFn: (noteId: number) =>
      apiFetch<{ message: string }>(
        `/api/company/candidates/${professionalId}/notes/${noteId}`,
        { method: "DELETE" }
      ),
    onSuccess: invalidate,
  });
}

/**
 * Upsert do parecer do membro logado. Invalida o consolidado E o board -- o card do board
 * mostra average/count do scorecard (ver PipelineCardDTO.evaluation).
 */
export function useUpsertMyEvaluation(projectId: number, matchId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CandidateEvaluationRequestDTO) =>
      apiFetch<CandidateEvaluationItemDTO>(
        `/api/projects/${projectId}/pipeline/matches/${matchId}/evaluations/mine`,
        { method: "PUT", body }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: candidateEvaluationsKey(projectId, matchId),
      });
      queryClient.invalidateQueries({
        queryKey: pipelineBoardKey(projectId),
      });
    },
  });
}
