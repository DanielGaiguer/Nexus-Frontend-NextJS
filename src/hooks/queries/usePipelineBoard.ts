import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { PipelineBoardDTO, PipelineStageDTO } from "@/types/pipeline";

export const pipelineBoardKey = (projectId: number) =>
  ["company", "pipeline", projectId, "board"] as const;

export const pipelineStagesKey = (projectId: number) =>
  ["company", "pipeline", projectId, "stages"] as const;

/** Board pronto pra renderizar: colunas intermediárias + cards com coluna efetiva já resolvida. */
export function usePipelineBoard(projectId: number | undefined) {
  return useQuery({
    queryKey: pipelineBoardKey(projectId ?? 0),
    queryFn: () =>
      apiFetch<PipelineBoardDTO>(`/api/projects/${projectId}/pipeline`),
    enabled: projectId != null,
  });
}

/** Só as etapas (ativas + arquivadas), pra tela de gestão -- ver PipelineStageManager. */
export function usePipelineStages(
  projectId: number | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: pipelineStagesKey(projectId ?? 0),
    queryFn: () =>
      apiFetch<PipelineStageDTO[]>(
        `/api/projects/${projectId}/pipeline/stages`
      ),
    enabled: enabled && projectId != null,
  });
}
