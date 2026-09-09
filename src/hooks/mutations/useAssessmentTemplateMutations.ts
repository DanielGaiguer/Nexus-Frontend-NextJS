import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  AssessmentTemplateRequestDTO,
  AssessmentTemplateResponseDTO,
} from "@/types/assessment-template";

/** Invalida as duas variações da listagem (com e sem `applicableOnly`) -- aposentar um molde
 * muda o que aparece em cada uma delas. */
function useInvalidateTemplates() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ["company", "assessment-templates"],
    });
}

export function useCreateAssessmentTemplate() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (body: AssessmentTemplateRequestDTO) =>
      apiFetch<AssessmentTemplateResponseDTO>("/api/assessment-templates", {
        method: "POST",
        body,
      }),
    onSuccess: invalidate,
  });
}

/** Editar um molde NÃO altera etapas já geradas a partir dele -- elas são cópias autônomas (ver
 * AssessmentTemplateService). Por isso não há nada de questionário de vaga a invalidar aqui. */
export function useUpdateAssessmentTemplate() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: AssessmentTemplateRequestDTO & { id: number }) =>
      apiFetch<AssessmentTemplateResponseDTO>(
        `/api/assessment-templates/${id}`,
        {
          method: "PUT",
          body,
        }
      ),
    onSuccess: invalidate,
  });
}

/** Aposentar / reativar. Não existe exclusão: etapas já geradas apontam pro molde. */
export function useSetAssessmentTemplateActive() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      apiFetch<AssessmentTemplateResponseDTO>(
        `/api/assessment-templates/${id}/active?active=${active}`,
        { method: "PUT" }
      ),
    onSuccess: invalidate,
  });
}
