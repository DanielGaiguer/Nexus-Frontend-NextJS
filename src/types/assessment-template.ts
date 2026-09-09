import type { ScreeningStageKind } from "./screening";

/** Um molde é conteúdo genérico reaplicável: nem item comportamental (banco fixo de plataforma)
 * nem pergunta de vídeo (específica de uma vaga). O backend recusa os dois -- o tipo aqui é
 * estreito de propósito, pra o erro aparecer na compilação e não numa 400 em runtime. */
export type AssessmentTemplateQuestionType = "MULTIPLE_CHOICE" | "ESSAY";

/**
 * Biblioteca de testes reutilizáveis da empresa (lógica, português, inglês, o que ela quiser).
 * Espelha com.main.nexus.dto.AssessmentTemplate*.
 *
 * O molde NÃO tem vínculo com vaga nenhuma. Aplicá-lo COPIA as questões para uma etapa nova
 * daquela vaga -- editar o molde depois não altera nada que já foi aplicado (ver
 * AssessmentTemplateService no backend). Isso é regra de produto, não detalhe de implementação:
 * a tela precisa deixar claro que aplicar é "duplicar aqui", não "linkar".
 */

/** Espelha com.main.nexus.dto.AssessmentTemplateQuestionRequestDTO — sem `id`, porque editar um
 * molde substitui a lista inteira (nada referencia essas linhas). */
export interface AssessmentTemplateQuestionRequestDTO {
  type: AssessmentTemplateQuestionType;
  prompt: string;
  options: string[];
  correctOptionIndex: number | null;
}

/** Espelha com.main.nexus.dto.AssessmentTemplateQuestionResponseDTO — inclui gabarito, porque só
 * a empresa dona do molde chega aqui (o candidato nunca vê um molde, vê a cópia). */
export interface AssessmentTemplateQuestionResponseDTO {
  id: number;
  type: AssessmentTemplateQuestionType;
  prompt: string;
  options: string[];
  correctOptionIndex: number | null;
}

/** Espelha com.main.nexus.dto.AssessmentTemplateRequestDTO. */
export interface AssessmentTemplateRequestDTO {
  title: string;
  /** Só QUESTIONS é aceito pelo backend: comportamental é banco fixo de plataforma e vídeo é
   * pergunta sobre uma vaga concreta -- nenhum dos dois é "genérico e reaplicável". */
  kind: ScreeningStageKind;
  instructions: string | null;
  responseDeadlineDays: number;
  questions: AssessmentTemplateQuestionRequestDTO[];
}

/** Espelha com.main.nexus.dto.AssessmentTemplateResponseDTO. */
export interface AssessmentTemplateResponseDTO {
  id: number;
  title: string;
  kind: ScreeningStageKind;
  instructions: string | null;
  responseDeadlineDays: number;
  active: boolean;
  createdAt: string;
  questions: AssessmentTemplateQuestionResponseDTO[];
}

/** Espelha com.main.nexus.dto.ApplyAssessmentTemplateRequestDTO -- aplicar o molde a uma vaga
 * pelo backend. Usado só fora do formulário da vaga; dentro dele a cópia é feita no client (ver
 * ApplyTemplateButton), pra não criar etapa no banco enquanto o formulário segura estado velho. */
export interface ApplyAssessmentTemplateRequestDTO {
  projectId: number;
  title: string | null;
  responseDeadlineDays: number | null;
}
