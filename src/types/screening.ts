import type { OpportunityType } from "./auth";
import type { ScoreBreakdownDTO } from "./match";

/** Espelha com.main.nexus.model.enums.ScreeningQuestionType. */
export type ScreeningQuestionType =
  | "MULTIPLE_CHOICE"
  | "ESSAY"
  /** Item Likert de 5 pontos. Só existe dentro de etapa BEHAVIORAL, e vem do banco fixo de
   * plataforma -- a empresa nunca escreve um destes (o editor nem oferece a opção). */
  | "LIKERT_SCALE"
  /** Resposta gravada em vídeo. Só existe dentro de etapa VIDEO. */
  | "VIDEO_RESPONSE";

/** Espelha com.main.nexus.model.enums.ScreeningStageKind. Decide a UI inteira da etapa, tanto no
 * editor da empresa quanto na tela de resposta do candidato. */
export type ScreeningStageKind = "QUESTIONS" | "BEHAVIORAL" | "VIDEO";

export const screeningStageKindLabels: Record<ScreeningStageKind, string> = {
  QUESTIONS: "Perguntas",
  BEHAVIORAL: "Perfil comportamental",
  VIDEO: "Resposta em vídeo",
};

/** Aviso obrigatório que acompanha TODO resultado comportamental. Espelha
 * ScreeningTraitProfileDTO.DISCLAIMER no backend, onde ele viaja dentro do próprio payload -- a
 * cópia aqui é só pro editor, que mostra o aviso antes de existir qualquer resultado. */
export const BEHAVIORAL_DISCLAIMER =
  "Resultado autodeclarado, indicativo — não é laudo psicológico nem substitui avaliação de profissional de RH/Psicologia.";

/**
 * Escala Likert de 5 pontos dos itens comportamentais. Espelha ScreeningLikertScale.LABELS no
 * backend -- lá ela existe porque o export LGPD entrega JSON direto ao titular, sem passar por
 * tela; aqui, porque é o que o candidato lê.
 *
 * O ÍNDICE é o que trafega (0..4 em ScreeningAnswerSubmitDTO.selectedOptionIndex). Reordenar
 * este array muda o significado de toda resposta já gravada -- não reordene.
 */
export const LIKERT_LABELS = [
  "Discordo totalmente",
  "Discordo",
  "Neutro",
  "Concordo",
  "Concordo totalmente",
] as const;

/** Espelha com.main.nexus.model.enums.BigFiveDimension. */
export type BigFiveDimension =
  | "OPENNESS"
  | "CONSCIENTIOUSNESS"
  | "EXTRAVERSION"
  | "AGREEABLENESS"
  | "NEUROTICISM";

/** Espelha com.main.nexus.dto.ScreeningTraitScoreDTO.
 *
 * `score` é 0-100 dentro da escala do próprio instrumento, NÃO percentil populacional -- não há
 * amostra normativa brasileira por trás. `answeredItemCount` acompanha porque um score apurado
 * sobre 10 itens e um sobre 2 não têm o mesmo peso. */
export interface ScreeningTraitScoreDTO {
  dimension: BigFiveDimension;
  label: string;
  score: number;
  answeredItemCount: number;
}

/** Espelha com.main.nexus.dto.ScreeningTraitProfileDTO.
 *
 * O aviso é campo DESTE objeto, e não de quem o contém -- é assim que fica estruturalmente
 * impossível renderizar os números sem ter o texto à mão. A UI deve exibi-lo junto do gráfico,
 * sempre. */
export interface ScreeningTraitProfileDTO {
  scores: ScreeningTraitScoreDTO[];
  disclaimer: string;
}

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
  kind: ScreeningStageKind;
  /** Só lido em etapa NOVA -- de qual molde ela saiu. O formulário da vaga copia as questões do
   * molde localmente e salva tudo junto (em vez de chamar /apply no meio da edição, que criaria
   * a etapa no banco enquanto o formulário segura estado velho). */
  sourceTemplateId: number | null;
  title: string;
  instructions: string | null;
  responseDeadlineDays: number;
  questions: ScreeningQuestionRequestDTO[];
}

/** Espelha com.main.nexus.dto.ScreeningStageResponseDTO. */
export interface ScreeningStageResponseDTO {
  id: number;
  kind: ScreeningStageKind;
  orderIndex: number;
  title: string;
  instructions: string | null;
  responseDeadlineDays: number;
  active: boolean;
  /** Vem VAZIA numa etapa BEHAVIORAL: os itens do inventário não são editáveis pela empresa e
   * não devem fazer round-trip pelo formulário da vaga. */
  questions: ScreeningQuestionResponseDTO[];
  /** Quantos itens a etapa comportamental tem -- null nas demais. É a única coisa que o editor
   * precisa exibir sobre o conteúdo dela. */
  behavioralItemCount: number | null;
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
  /** Perfil de traços -- null fora de etapa comportamental. Chega até o card do Kanban por aqui
   * (PipelineCardDTO.latestScreening), sempre como informação, nunca como critério. */
  traitProfile: ScreeningTraitProfileDTO | null;
}

/** Espelha com.main.nexus.dto.ScreeningAttemptQuestionDTO — sem gabarito, exibida ao
 * profissional enquanto ele responde. */
export interface ScreeningAttemptQuestionDTO {
  id: number;
  type: ScreeningQuestionType;
  prompt: string;
  /** Vazia em LIKERT_SCALE (a escala é fixa, ver LIKERT_LABELS) e em VIDEO_RESPONSE. */
  options: string[];
  /** VIDEO_RESPONSE: já existe um vídeo enviado para esta questão nesta tentativa. É o que
   * permite fechar a aba no meio e voltar sem perder o que já subiu. */
  videoUploaded: boolean;
}

/** Espelha com.main.nexus.dto.ScreeningAttemptDTO. */
export interface ScreeningAttemptDTO {
  invitationId: number;
  screeningQuestionnaireTitle: string;
  /** Instruções GERAIS do processo -- diferente de `instructions` abaixo, que é só desta etapa. */
  questionnaireInstructions: string | null;
  stageTitle: string;
  /** Decide a UI inteira desta tela: perguntas comuns, inventário Likert ou gravação de vídeo. */
  stageKind: ScreeningStageKind;
  stageOrderIndex: number;
  totalStages: number;
  instructions: string | null;
  status: ScreeningInvitationStatus;
  deadlineAt: string;
  projectTitle: string;
  companyName: string;
  questions: ScreeningAttemptQuestionDTO[];
  /** Consentimento de gravação DESTA tentativa -- só relevante numa etapa VIDEO. Enquanto for
   * false a tela não pode nem pedir a câmera: o backend recusa assinar upload sem ele. */
  videoConsentAccepted: boolean;
  /** Já aceito -> o texto que a pessoa leu; ainda não -> o texto vigente. */
  videoConsentText: string;
  /** Teto de tamanho aceito pelo backend. Serve pra barrar antes de gastar upload -- quem decide
   * de verdade é o backend, medindo o arquivo no Supabase depois que ele sobe. */
  videoMaxSizeBytes: number;
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

  /** VIDEO_RESPONSE. A URL do objeto nunca sai do backend -- para assistir, peça um link
   * assinado em /video/{questionId}/playback. `hasVideo` false com `videoDurationSeconds`
   * preenchido = existiu um vídeo e o arquivo foi removido (exclusão de conta). */
  hasVideo: boolean;
  videoDurationSeconds: number | null;

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
  /** Instruções GERAIS do processo -- diferente de `instructions` abaixo, que é só desta etapa. */
  questionnaireInstructions: string | null;
  screeningStageId: number;
  stageTitle: string;
  /** Diz à tela de revisão o que ela está olhando. Não dá pra inferir do traitProfile: uma etapa
   * comportamental ainda não respondida não tem perfil nenhum e pareceria uma etapa de perguntas
   * vazia. */
  stageKind: ScreeningStageKind;
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
  // null numa etapa comportamental: lá não existe resposta certa, e o resultado é o traitProfile.
  autoScorePercent: number | null;
  /** Perfil Big Five -- preenchido só em etapa comportamental. O aviso obrigatório viaja dentro
   * dele. */
  traitProfile: ScreeningTraitProfileDTO | null;
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
