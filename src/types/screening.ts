import type { OpportunityType } from "./auth";
import type { ScoreBreakdownDTO } from "./match";

/** Espelha com.main.nexus.model.enums.ScreeningQuestionType. */
export type ScreeningQuestionType = "MULTIPLE_CHOICE" | "ESSAY";

/** Espelha com.main.nexus.model.enums.ScreeningInvitationStatus. */
export type ScreeningInvitationStatus =
  | "SENT"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "APPROVED"
  | "REPROVED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED";

export const screeningInvitationStatusLabels: Record<
  ScreeningInvitationStatus,
  string
> = {
  SENT: "Enviado",
  IN_PROGRESS: "Em andamento",
  SUBMITTED: "Aguardando decisão",
  APPROVED: "Aprovado",
  REPROVED: "Reprovado",
  DECLINED: "Recusado",
  // Diferente de DECLINED/CANCELLED: não permite nova tentativa (ver
  // ScreeningInvitationService.checkGate) -- o rótulo deixa isso explícito pros dois lados, em
  // vez de só "Expirado".
  EXPIRED: "Não respondeu",
  // Etapa ou projeto associado foi encerrado com o convite ainda pendente -- diferente de
  // DECLINED (recusa ativa) e EXPIRED (prazo estourado).
  CANCELLED: "Cancelado",
};

/** Espelha com.main.nexus.dto.ScreeningQuestionRequestDTO. `id` nulo = questão nova. */
export interface ScreeningQuestionRequestDTO {
  id: number | null;
  type: ScreeningQuestionType;
  prompt: string;
  options: string[];
  correctOptionIndex: number | null;
}

/** Espelha com.main.nexus.dto.ScreeningQuestionResponseDTO — inclui gabarito (só empresa). */
export interface ScreeningQuestionResponseDTO {
  id: number;
  type: ScreeningQuestionType;
  prompt: string;
  options: string[];
  correctOptionIndex: number | null;
}

/** Espelha com.main.nexus.dto.ScreeningStageRequestDTO. `id` nulo = etapa nova. */
export interface ScreeningStageRequestDTO {
  id: number | null;
  title: string;
  instructions: string | null;
  responseDeadlineDays: number;
  questions: ScreeningQuestionRequestDTO[];
}

/** Espelha com.main.nexus.dto.ScreeningStageResponseDTO. */
export interface ScreeningStageResponseDTO {
  id: number;
  orderIndex: number;
  title: string;
  instructions: string | null;
  responseDeadlineDays: number;
  active: boolean;
  questions: ScreeningQuestionResponseDTO[];
}

/** Espelha com.main.nexus.dto.ScreeningQuestionnaireRequestDTO. */
export interface ScreeningQuestionnaireRequestDTO {
  projectId: number;
  title: string;
  instructions: string | null;
  stages: ScreeningStageRequestDTO[];
}

/** Espelha com.main.nexus.dto.ScreeningQuestionnaireResponseDTO. */
export interface ScreeningQuestionnaireResponseDTO {
  id: number;
  projectId: number;
  projectTitle: string;
  title: string;
  instructions: string | null;
  createdAt: string;
  stages: ScreeningStageResponseDTO[];
}

/** Espelha com.main.nexus.dto.ScreeningInvitationSummaryDTO — seguro pra embutir em listas.
 * stageOrderIndex/totalStages são 1-based, prontos pra exibir "Etapa X de N". */
export interface ScreeningInvitationSummaryDTO {
  id: number;
  screeningQuestionnaireId: number;
  screeningQuestionnaireTitle: string;
  stageTitle: string;
  stageOrderIndex: number;
  totalStages: number;
  status: ScreeningInvitationStatus;
  sentAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  autoScorePercent: number | null;
}

/** Espelha com.main.nexus.dto.ScreeningAttemptQuestionDTO — sem gabarito, exibida ao
 * profissional enquanto ele responde. */
export interface ScreeningAttemptQuestionDTO {
  id: number;
  type: ScreeningQuestionType;
  prompt: string;
  options: string[];
}

/** Espelha com.main.nexus.dto.ScreeningAttemptDTO. */
export interface ScreeningAttemptDTO {
  invitationId: number;
  screeningQuestionnaireTitle: string;
  stageTitle: string;
  stageOrderIndex: number;
  totalStages: number;
  instructions: string | null;
  status: ScreeningInvitationStatus;
  deadlineAt: string;
  projectTitle: string;
  companyName: string;
  questions: ScreeningAttemptQuestionDTO[];
}

/** Espelha com.main.nexus.dto.ScreeningAnswerSubmitDTO. */
export interface ScreeningAnswerSubmitDTO {
  questionId: number;
  selectedOptionIndex: number | null;
  essayText: string | null;
  timeSpentSeconds: number;
}

/** Espelha com.main.nexus.dto.ScreeningSubmissionRequestDTO. */
export interface ScreeningSubmissionRequestDTO {
  answers: ScreeningAnswerSubmitDTO[];
  totalTimeSpentSeconds: number;
  tabSwitchCount: number;
}

/** Espelha com.main.nexus.dto.ScreeningStageDecisionRequestDTO -- corpo de /approve e /reprove.
 * Sem nota por questão -- decisão binária pela etapa inteira. */
export interface ScreeningStageDecisionRequestDTO {
  comment: string | null;
}

/** Espelha com.main.nexus.dto.ScreeningAnswerDetailDTO. */
export interface ScreeningAnswerDetailDTO {
  answerId: number;
  questionId: number;
  type: ScreeningQuestionType;
  prompt: string;
  options: string[];

  selectedOptionIndex: number | null;
  correctOptionIndex: number | null;
  correct: boolean | null;

  essayText: string | null;

  timeSpentSeconds: number | null;
}

/**
 * Espelha com.main.nexus.dto.ScreeningInvitationDetailDTO — visão pós-submissão de UMA etapa,
 * tanto pra empresa decidindo (aprovar/reprovar) quanto pro profissional vendo o próprio
 * resultado. tabSwitchCount vem null quando quem pediu não é a empresa (decisão confirmada de
 * manter esse sinal visível só pro contratante).
 */
export interface ScreeningInvitationDetailDTO {
  id: number;
  screeningQuestionnaireId: number;
  screeningQuestionnaireTitle: string;
  screeningStageId: number;
  stageTitle: string;
  stageOrderIndex: number;
  totalStages: number;
  instructions: string | null;
  projectId: number;
  projectTitle: string;
  professionalId: number;
  professionalName: string;

  status: ScreeningInvitationStatus;
  sentAt: string;
  deadlineAt: string;
  startedAt: string | null;
  submittedAt: string | null;
  decidedAt: string | null;

  totalTimeSpentSeconds: number | null;
  tabSwitchCount: number | null;
  // Referência/sugestão, calculada só das questões de múltipla escolha -- nunca decide sozinha.
  autoScorePercent: number | null;
  companyDecisionComment: string | null;

  // pendingProposalId só preenchido quando pendingIntentType === "PROPOSAL_SUBMIT" -- usado pra
  // mostrar a proposta associada num painel separado (aceite/recusa dela é sempre independente
  // do resultado da etapa).
  pendingIntentType:
    "MATCH_INTEREST" | "MATCH_ACCEPT" | "PROPOSAL_SUBMIT" | null;
  pendingProposalId: number | null;

  answers: ScreeningAnswerDetailDTO[];

  /** Todas as etapas do questionário, mesmo formato de ScreeningProcessSummaryDTO.stages -- dá
   * pra desenhar o fluxo completo nesta tela, destacando a etapa atual (screeningStageId acima). */
  stages: ScreeningStageStatusDTO[];
}

/** Espelha com.main.nexus.dto.ScreeningStageStatusDTO -- status/invitationId nulos = o
 * profissional ainda não chegou nesta etapa. */
export interface ScreeningStageStatusDTO {
  stageId: number;
  orderIndex: number;
  title: string;
  status: ScreeningInvitationStatus | null;
  invitationId: number | null;
}

/**
 * Espelha com.main.nexus.dto.ScreeningProcessSummaryDTO — um processo seletivo inteiro (todas as
 * etapas de um questionário, pra um profissional), base das telas "Processos Seletivos" dos dois
 * lados. currentStatus/currentInvitationId refletem a tentativa mais recente entre todas as
 * etapas.
 */
export interface ScreeningProcessSummaryDTO {
  screeningQuestionnaireId: number;
  projectId: number;
  projectTitle: string;
  opportunityType: OpportunityType;

  professionalId: number;
  professionalName: string;
  professionalProfilePhotoUrl: string | null;
  professionalReputation: number | null;

  companyId: number;
  companyName: string;
  companyProfilePhotoUrl: string | null;

  currentStatus: ScreeningInvitationStatus;
  currentInvitationId: number;
  currentStageOrderIndex: number;
  totalStages: number;
  lastActivityAt: string;

  stages: ScreeningStageStatusDTO[];

  /** Mesmo formato/mesma fonte do card de match -- deixa o cabeçalho deste card idêntico. */
  scoreBreakdown: ScoreBreakdownDTO;
}
