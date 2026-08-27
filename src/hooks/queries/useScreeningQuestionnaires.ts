import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ScreeningQuestionnaireResponseDTO } from "@/types/screening";

/** Um hook por endpoint de questionário de triagem (ver ScreeningQuestionnaireController). */

export const projectScreeningQuestionnaireKey = (projectId: number) =>
  ["company", "screening-questionnaires", "project", projectId] as const;

/** O questionário de triagem da vaga (0 ou 1 -- 1:1 com o projeto), pra tela de gestão. */
export function useProjectScreeningQuestionnaire(projectId: number) {
  return useQuery({
    queryKey: projectScreeningQuestionnaireKey(projectId),
    queryFn: () =>
      apiFetch<ScreeningQuestionnaireResponseDTO | null>(
        `/api/screening-questionnaires/project/${projectId}`
      ),
    enabled: Number.isFinite(projectId),
  });
}
