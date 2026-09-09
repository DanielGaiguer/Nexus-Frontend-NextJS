import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { AssessmentTemplateResponseDTO } from "@/types/assessment-template";

/** Biblioteca de testes reutilizáveis da empresa (ver AssessmentTemplateController). */

export const assessmentTemplatesKey = (applicableOnly: boolean) =>
  ["company", "assessment-templates", { applicableOnly }] as const;

/**
 * `applicableOnly` separa duas perguntas diferentes: a tela da biblioteca lista TUDO (inclusive
 * aposentados, marcados como tal -- escondê-los faria a empresa achar que sumiram), enquanto o
 * seletor "aplicar molde" só pode oferecer os que o backend ainda aceita aplicar.
 */
export function useAssessmentTemplates(applicableOnly = false) {
  return useQuery({
    queryKey: assessmentTemplatesKey(applicableOnly),
    queryFn: () =>
      apiFetch<AssessmentTemplateResponseDTO[]>(
        `/api/assessment-templates?applicableOnly=${applicableOnly}`
      ),
  });
}
