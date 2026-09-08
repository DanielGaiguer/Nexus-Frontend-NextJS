import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  pipelineBoardKey,
  pipelineStagesKey,
} from "@/hooks/queries/usePipelineBoard";
import { ApiError, apiFetch } from "@/lib/api-client";
import type {
  MovePipelineCardRequestDTO,
  PipelineBoardDTO,
  PipelineCardDTO,
  PipelineStageDTO,
  PipelineStagesRequestDTO,
} from "@/types/pipeline";

/**
 * Mover um card entre etapas intermediárias -- OTIMISTA: o card pula de coluna na hora e volta
 * atrás se o PUT falhar. Sem diálogo de confirmação (comportamento normal de Kanban). Este hook
 * NUNCA é usado pra soltar em "Contratado"/"Reprovado" -- essas são as ações reais (aceitar /
 * RejectInterestDialog), disparadas pelo board.
 */
export function useMovePipelineCard(projectId: number) {
  const queryClient = useQueryClient();
  const key = pipelineBoardKey(projectId);

  return useMutation({
    mutationFn: ({ matchId, stageId }: { matchId: number; stageId: number }) =>
      apiFetch<PipelineCardDTO>(
        `/api/projects/${projectId}/pipeline/matches/${matchId}/stage`,
        {
          method: "PUT",
          body: { stageId } satisfies MovePipelineCardRequestDTO,
        }
      ),

    onMutate: async ({ matchId, stageId }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PipelineBoardDTO>(key);
      if (previous) {
        queryClient.setQueryData<PipelineBoardDTO>(key, {
          ...previous,
          cards: previous.cards.map((card) =>
            card.matchId === matchId && card.column.kind === "STAGE"
              ? { ...card, column: { ...card.column, stageId, subLabel: null } }
              : card
          ),
        });
      }
      return { previous };
    },

    onError: (error, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(key, ctx.previous);
      }
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível mover o card."
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

/** CRUD das etapas em bloco (adicionar / renomear / reordenar / desativar) -- ver PipelineService.replaceStages. */
export function useReplacePipelineStages(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PipelineStagesRequestDTO) =>
      apiFetch<PipelineStageDTO[]>(
        `/api/projects/${projectId}/pipeline/stages`,
        { method: "PUT", body }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineStagesKey(projectId) });
      queryClient.invalidateQueries({ queryKey: pipelineBoardKey(projectId) });
    },
  });
}
