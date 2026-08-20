/** Espelha com.main.nexus.model.enums.AuthorType. */
export type AuthorType = "COMPANY" | "PROFESSIONAL";

/** Espelha com.main.nexus.model.enums.PositiveReason. */
export type PositiveReason =
  | "EXCELLENT_COMMUNICATION"
  | "HIGH_TECHNICAL_SKILL"
  | "DELIVERED_ON_TIME"
  | "TEAM_PLAYER"
  | "PROACTIVE"
  | "EXCEEDED_EXPECTATIONS"
  | "RELIABLE"
  | "PUNCTUAL"
  | "HIGH_CODE_QUALITY"
  | "GOOD_PROBLEM_SOLVING";

/** Espelha com.main.nexus.model.enums.NegativeReason. */
export type NegativeReason =
  | "MISSED_DEADLINES"
  | "POOR_COMMUNICATION"
  | "LOW_CODE_QUALITY"
  | "UNPROFESSIONAL"
  | "ABSENT"
  | "UNRELIABLE"
  | "POOR_PROBLEM_SOLVING"
  | "DID_NOT_MEET_EXPECTATIONS"
  | "OTHER";

/** Rótulos em pt-BR — espelha com.main.nexus.util.ReviewReasonMapper#toPortuguese(PositiveReason). */
export const positiveReasonOptions: { value: PositiveReason; label: string }[] =
  [
    { value: "EXCELLENT_COMMUNICATION", label: "Comunicação excelente" },
    { value: "HIGH_TECHNICAL_SKILL", label: "Alta competência técnica" },
    { value: "DELIVERED_ON_TIME", label: "Entregou no prazo" },
    { value: "TEAM_PLAYER", label: "Trabalho em equipe" },
    { value: "PROACTIVE", label: "Proatividade" },
    { value: "EXCEEDED_EXPECTATIONS", label: "Superou expectativas" },
    { value: "RELIABLE", label: "Confiável" },
    { value: "PUNCTUAL", label: "Pontual" },
    { value: "HIGH_CODE_QUALITY", label: "Alta qualidade de código" },
    { value: "GOOD_PROBLEM_SOLVING", label: "Boa resolução de problemas" },
  ];

/** Rótulos em pt-BR — espelha com.main.nexus.util.ReviewReasonMapper#toPortuguese(NegativeReason). */
export const negativeReasonOptions: { value: NegativeReason; label: string }[] =
  [
    { value: "MISSED_DEADLINES", label: "Atrasos nas entregas" },
    { value: "POOR_COMMUNICATION", label: "Comunicação deficiente" },
    { value: "LOW_CODE_QUALITY", label: "Baixa qualidade técnica" },
    { value: "UNPROFESSIONAL", label: "Falta de profissionalismo" },
    { value: "ABSENT", label: "Ausências frequentes" },
    { value: "UNRELIABLE", label: "Pouco confiável" },
    {
      value: "POOR_PROBLEM_SOLVING",
      label: "Dificuldade em resolver problemas",
    },
    {
      value: "DID_NOT_MEET_EXPECTATIONS",
      label: "Não atingiu as expectativas",
    },
    { value: "OTHER", label: "Outros" },
  ];

/** Espelha com.main.nexus.dto.ReviewRequestDTO. */
export interface ReviewRequestDTO {
  rating: number;
  comment: string | null;
  authorType: AuthorType;
  positiveReasons: PositiveReason[];
  negativeReasons: NegativeReason[];
}

/**
 * Espelha com.main.nexus.dto.ReviewDisplayDTO — já vem com nome/foto de quem
 * avaliou e os motivos traduzidos pro português (o backend resolve isso via
 * ReviewReasonMapper), o client só renderiza.
 */
export interface ReviewDisplayDTO {
  id: number;
  rating: number;
  comment: string | null;
  positiveReasons: string[];
  negativeReasons: string[];
  reviewerName: string;
  reviewerPhotoUrl: string | null;
  reviewerType: AuthorType;
  opportunityTitle: string;
  createdAt: string;
}

/** Espelha com.main.nexus.dto.ReviewPageDTO. */
export interface ReviewPageDTO {
  reviews: ReviewDisplayDTO[];
  totalReviews: number;
  averageRating: number;
}

/** Espelha com.main.nexus.dto.PendingReviewDTO. */
export interface PendingReviewDTO {
  matchId: number;
  otherPartyName: string;
  projectTitle: string;
}

/** Espelha com.main.nexus.model.enums.MatchOutcome. */
export type MatchOutcome =
  | "WORKING_TOGETHER"
  | "PROJECT_COMPLETED"
  | "DID_NOT_WORK_OUT"
  | "NO_CONTACT_YET";

export const matchOutcomeOptions: {
  value: MatchOutcome;
  emoji: string;
  title: string;
  description: string;
}[] = [
  {
    value: "WORKING_TOGETHER",
    emoji: "✅",
    title: "Sim, já estamos trabalhando juntos",
    description: "O projeto está em andamento.",
  },
  {
    value: "PROJECT_COMPLETED",
    emoji: "🏁",
    title: "Sim, e o projeto já foi concluído",
    description: "Trabalhamos juntos e o projeto terminou.",
  },
  {
    value: "DID_NOT_WORK_OUT",
    emoji: "❌",
    title: "Não, o match não deu certo",
    description: "Não chegamos a trabalhar juntos.",
  },
  {
    value: "NO_CONTACT_YET",
    emoji: "⏳",
    title: "Ainda não estabelecemos contato",
    description: "Ainda não conversamos sobre o projeto.",
  },
];

/** Espelha com.main.nexus.dto.MatchStatusCheckRequestDTO. */
export interface MatchStatusCheckRequestDTO {
  outcome: MatchOutcome;
}

/** Espelha com.main.nexus.dto.PendingStatusCheckDTO — só empresa responde. */
export interface PendingStatusCheckDTO {
  matchId: number;
  professionalName: string;
  projectTitle: string;
}
