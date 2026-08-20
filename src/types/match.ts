import type { ProjectResponseDTO } from "./project";

/** Espelha com.main.nexus.model.enums.InterestStatus. */
export type InterestStatus = "PENDING" | "INTERESTED" | "REJECTED";

/** Espelha com.main.nexus.model.enums.StatusMatch. */
export type StatusMatch =
  | "WAITING"
  | "COMPANY_INTERESTED"
  | "PROFESSIONAL_INTERESTED"
  | "MATCHED"
  | "REJECTED";

/** Espelha com.main.nexus.dto.ProfessionalSummaryDTO. */
export interface ProfessionalSummaryDTO {
  id: number;
  name: string;
  phone: string | null;
  reputation: number | null;
  profilePhotoUrl: string | null;
  skills: string[];
}

/** Espelha com.main.nexus.dto.ScoreBreakdownDTO. */
export interface ScoreBreakdownDTO {
  skills: number;
  budget: number;
  history: number;
  reputation: number;
  availability: number;
  distance: number | null;
  experience: number | null;
  reputationAdjustment: number;
  finalScore: number;
}

/**
 * Espelha com.main.nexus.dto.MatchResponseDTO. rejectionReasons carrega
 * nomes brutos de enum — tanto de ProfessionalRejectionReason quanto de
 * CompanyRejectionReason, dependendo de quem recusou (ver rejectionReasonLabels).
 */
export interface MatchResponseDTO {
  id: number;
  matchScore: number | null;
  companyStatus: InterestStatus;
  professionalStatus: InterestStatus;
  status: StatusMatch;
  createdAt: string;
  project: ProjectResponseDTO;
  professional: ProfessionalSummaryDTO;
  scoreBreakdown: ScoreBreakdownDTO | null;
  active: boolean | null;
  rejectionReasons: string[] | null;
  rejectionDescription: string | null;
}

/** Espelha com.main.nexus.model.enums.ProfessionalRejectionReason. */
export type ProfessionalRejectionReason =
  | "TOO_LOW_BUDGET"
  | "UNDESIRED_TECHNOLOGY"
  | "DISTANCE_TOO_LARGE"
  | "NO_REMOTE_OPTION"
  | "RELOCATION_NOT_ACCEPTED"
  | "TIMEZONE_INCOMPATIBILITY"
  | "NOT_AVAILABLE_TIMELINE"
  | "IMMEDIATE_START_REQUIRED"
  | "CANNOT_MEET_SCHEDULE"
  | "CULTURE_MISMATCH"
  | "COMPANY_SIZE_PREFERENCE"
  | "WORK_MODEL_MISMATCH"
  | "DEADLINE_TOO_SHORT"
  | "COST_BENEFIT_INADEQUATE"
  | "HIRING_FROZEN"
  | "PROJECT_CANCELLED"
  | "OTHER";

/** Opções que o profissional pode marcar ao recusar um convite (pro-matches.html :: #rejectModal). */
export const professionalRejectionReasonOptions: {
  value: ProfessionalRejectionReason;
  label: string;
}[] = [
  { value: "TOO_LOW_BUDGET", label: "Orçamento muito baixo" },
  { value: "UNDESIRED_TECHNOLOGY", label: "Tecnologia indesejada" },
  { value: "DISTANCE_TOO_LARGE", label: "Distância muito grande" },
  { value: "NO_REMOTE_OPTION", label: "Não é remoto" },
  { value: "RELOCATION_NOT_ACCEPTED", label: "Não aceito me mudar" },
  { value: "TIMEZONE_INCOMPATIBILITY", label: "Fuso horário incompatível" },
  { value: "NOT_AVAILABLE_TIMELINE", label: "Sem disponibilidade no prazo" },
  { value: "IMMEDIATE_START_REQUIRED", label: "Início imediato exigido" },
  { value: "CANNOT_MEET_SCHEDULE", label: "Não consigo cumprir a agenda" },
  { value: "CULTURE_MISMATCH", label: "Cultura não combina" },
  { value: "WORK_MODEL_MISMATCH", label: "Modelo de trabalho não combina" },
  { value: "DEADLINE_TOO_SHORT", label: "Prazo muito curto" },
  { value: "COST_BENEFIT_INADEQUATE", label: "Custo-benefício inadequado" },
  { value: "OTHER", label: "Outro motivo" },
];

/**
 * Rótulos em português pra QUALQUER motivo de rejeição que pode aparecer num
 * MatchResponseDTO.rejectionReasons — inclui tanto os que o profissional
 * escolhe (acima) quanto os exclusivos de CompanyRejectionReason (a empresa
 * recusando um interesse do profissional), porque o mesmo card de match
 * recusado pode mostrar motivos de qualquer um dos dois lados.
 */
export const rejectionReasonLabels: Record<string, string> = {
  MISSING_REQUIRED_SKILLS: "Faltam skills exigidas",
  INSUFFICIENT_EXPERIENCE: "Experiência insuficiente",
  OVERQUALIFIED: "Superqualificado para a vaga",
  TECHNOLOGY_MISMATCH: "Tecnologia não combina",
  ROLE_EXPECTATION_MISMATCH: "Expectativa de papel não combina",
  INCOMPLETE_PROFILE: "Perfil incompleto",
  POOR_QUALITY_PORTFOLIO: "Portfólio de baixa qualidade",
  NO_RELEVANT_PROJECTS: "Sem projetos relevantes",
  FAILED_INTERVIEW_STAGE: "Não passou na entrevista",
  NO_RESPONSE_FROM_CANDIDATE: "Sem resposta do candidato",
  ANOTHER_CANDIDATE_SELECTED: "Outro candidato selecionado",
  POSITION_FILLED: "Vaga já preenchida",
  TOO_LOW_BUDGET: "Orçamento muito baixo",
  UNDESIRED_TECHNOLOGY: "Tecnologia indesejada",
  DISTANCE_TOO_LARGE: "Distância muito grande",
  NO_REMOTE_OPTION: "Não é remoto",
  RELOCATION_NOT_ACCEPTED: "Não aceito me mudar",
  TIMEZONE_INCOMPATIBILITY: "Fuso horário incompatível",
  NOT_AVAILABLE_TIMELINE: "Sem disponibilidade no prazo",
  IMMEDIATE_START_REQUIRED: "Início imediato exigido",
  CANNOT_MEET_SCHEDULE: "Não consigo cumprir a agenda",
  CULTURE_MISMATCH: "Cultura não combina",
  COMPANY_SIZE_PREFERENCE: "Preferência por tamanho de empresa",
  WORK_MODEL_MISMATCH: "Modelo de trabalho não combina",
  DEADLINE_TOO_SHORT: "Prazo muito curto",
  COST_BENEFIT_INADEQUATE: "Custo-benefício inadequado",
  HIRING_FROZEN: "Contratações congeladas",
  PROJECT_CANCELLED: "Projeto cancelado",
  OTHER: "Outro motivo",
};

/** Espelha com.main.nexus.dto.ProfessionalRejectRequestDTO. */
export interface ProfessionalRejectRequestDTO {
  reasons: ProfessionalRejectionReason[];
  description: string | null;
}

/** Espelha com.main.nexus.dto.ContactInfoDTO. */
export interface ContactInfoDTO {
  phone: string | null;
  email: string;
}
