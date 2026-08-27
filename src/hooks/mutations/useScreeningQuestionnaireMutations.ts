import { useMutation, useQueryClient } from "@tanstack/react-query";

import { projectScreeningQuestionnaireKey } from "@/hooks/queries/useScreeningQuestionnaires";
import { apiFetch } from "@/lib/api-client";
import type {
  ScreeningQuestionnaireRequestDTO,
  ScreeningQuestionnaireResponseDTO,
} from "@/types/screening";

/** Criação do questionário de triagem da vaga (só existe um por projeto -- 409 se já existir). */
export function useCreateScreeningQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ScreeningQuestionnaireRequestDTO) =>
      apiFetch<ScreeningQuestionnaireResponseDTO>("/api/screening-questionnaires", {
        method: "POST",
        body,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: projectScreeningQuestionnaireKey(data.projectId),
      });
    },
  });
}

/** Edição do questionário -- sem trava, sempre permitida (mesmo com candidatos em andamento),
 * sem efeito retroativo em quem já respondeu (ver ScreeningQuestionnaireService.mergeStages). */
export function useUpdateScreeningQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: ScreeningQuestionnaireRequestDTO & { id: number }) =>
      apiFetch<ScreeningQuestionnaireResponseDTO>(`/api/screening-questionnaires/${id}`, {
        method: "PUT",
        body,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: projectScreeningQuestionnaireKey(data.projectId),
      });
    },
  });
}
