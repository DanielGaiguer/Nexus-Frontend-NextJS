import type { CommissionChargeStatus } from "./billing";
import type {
  MatchConfirmationPendingReason,
  MatchConfirmationResolution,
  MatchConfirmationStatus,
} from "./match";
import type { MatchOutcome } from "./review";

/** Espelha com.main.nexus.dto.MonthlyMatchCountDTO. */
export interface MonthlyMatchCountDTO {
  label: string;
  value: number;
}

/** Espelha com.main.nexus.dto.AdminDashboardDTO. */
export interface AdminDashboardDTO {
  totalUsers: number;
  totalProfessionals: number;
  totalCompanies: number;
  totalProjects: number;
  totalOpenProjects: number;
  totalMatches: number;
  totalConfirmedMatches: number;
  /** % de matches que chegaram a MATCHED em relação ao total de matches existentes. */
  matchConversionRate: number;
  pendingCompanies: number;
  /** Matches por mês dos últimos 12 meses, todo o sistema. */
  monthlyMatches: MonthlyMatchCountDTO[];
}

/** Espelha com.main.nexus.dto.UserSummaryDTO. */
export interface UserSummaryDTO {
  id: number;
  name: string;
  email: string;
  type: "PROFESSIONAL" | "COMPANY" | "ADMIN";
  active: boolean;
  profilePhotoUrl: string | null;
  /**
   * Id da própria linha professional/company (PK independente da de `id`
   * acima, que é o User/login) — é este o id que /admin/professional/{id} e
   * /admin/company/{id} esperam. Nulo pra ADMIN.
   */
  entityId: number | null;
}

/** Espelha com.main.nexus.dto.RejectCompanyRequestDTO. */
export interface RejectCompanyRequestDTO {
  reason: string;
}

/** Espelha com.main.nexus.dto.SkillRequestDTO. */
export interface SkillRequestDTO {
  name: string;
  category: string;
}

/**
 * GET /api/admin/skills devolve a entidade `Skill` crua (não um DTO) —
 * espelhado aqui com os campos que ela de fato serializa.
 */
export interface AdminSkillDTO {
  id: number;
  name: string;
  category: string;
  active: boolean;
}

/** Espelha com.main.nexus.dto.ProfessionalDashboardDTO (visão do admin sobre um profissional). */
export interface ProfessionalDashboardDTO {
  professional: import("./professional").ProfessionalProfileDTO;
  totalProjects: number;
  totalMatches: number;
}

// ── Confirmações pós-contratação (camada financeira, Prompt 2) ──────

/** Espelha com.main.nexus.dto.AdminMatchConfirmationDTO. */
export interface AdminMatchConfirmationDTO {
  matchId: number;
  companyId: number;
  companyName: string;
  professionalId: number;
  professionalName: string;
  projectTitle: string;
  opportunityType: "PROJECT" | "JOB" | null;
  status: MatchConfirmationStatus;
  pendingReason: MatchConfirmationPendingReason | null;
  resolution: MatchConfirmationResolution | null;
  openedAt: string;
  deadline: string;
  resolvedAt: string | null;
  /** Dias desde que o caso entrou em PENDING_ADMIN_REVIEW (0 quando não está pendente). */
  daysPending: number;
  suggestedAmount: number | null;
  confirmedAmount: number | null;
  companyOutcome: MatchOutcome | null;
  companyAmount: number | null;
  professionalOutcome: MatchOutcome | null;
  professionalAmount: number | null;
  companyAnswered: boolean;
  professionalAnswered: boolean;
  adminReviewed: boolean;
  reviewedByAdminEmail: string | null;
  reviewedAt: string | null;
  adminNote: string | null;
  /** Cobrança de comissão vinculada (Prompt 5). null = gratuita / sem valor / billing off. */
  chargeStatus: CommissionChargeStatus | null;
  chargeAmount: number | null;
}

/** Espelha com.main.nexus.dto.AdminCompanyConfirmationOverviewDTO. */
export interface AdminCompanyConfirmationOverviewDTO {
  companyId: number;
  companyName: string;
  underObservation: boolean;
  suspicious: boolean;
  totalConfirmations: number;
  awaitingCount: number;
  confirmedCount: number;
  pendingReviewCount: number;
  closedNoChargeCount: number;
  closedUnresolvedCount: number;
  valueDivergenceCount: number;
  noResponseCount: number;
  completionDisagreementCount: number;
  unreviewedCount: number;
  confirmations: AdminMatchConfirmationDTO[];
}

/** Espelha com.main.nexus.dto.AdminConfirmationQueueItemDTO. */
export interface AdminConfirmationQueueItemDTO {
  companyId: number;
  companyName: string;
  underObservation: boolean;
  suspicious: boolean;
  pendingReviewCount: number;
  closedNoChargeCount: number;
  closedUnresolvedCount: number;
  valueDivergenceCount: number;
  noResponseCount: number;
  completionDisagreementCount: number;
  awaitingCount: number;
  unreviewedCount: number;
}

/** Corpo de POST /api/admin/confirmations/{matchId}/review. */
export interface AdminConfirmationReviewBody {
  note: string | null;
}

/** Corpo de PUT /api/admin/companies/{companyId}/observation. */
export interface AdminCompanyObservationBody {
  underObservation: boolean;
}

/** Corpo de POST /api/admin/confirmations/{matchId}/resolve. */
export interface AdminResolveConfirmationBody {
  finalAmount: number;
  note: string | null;
}

/** Corpo de POST /api/admin/confirmations/{matchId}/mark-unconfirmable. */
export interface AdminUnconfirmableBody {
  note: string | null;
}

export const matchConfirmationStatusLabels: Record<
  MatchConfirmationStatus,
  string
> = {
  AWAITING_RESPONSES: "Aguardando respostas",
  CONFIRMED: "Confirmada",
  PENDING_ADMIN_REVIEW: "Em análise",
  CLOSED_NO_CHARGE: "Encerrada sem cobrança",
  CLOSED_UNRESOLVED: "Encerrada sem confirmação",
};

export const matchConfirmationReasonLabels: Record<
  MatchConfirmationPendingReason,
  string
> = {
  VALUE_DIVERGENCE: "Divergência de valor",
  NO_RESPONSE: "Sem resposta no prazo",
  COMPLETION_DISAGREEMENT: "Divergência sobre conclusão",
};

export const matchConfirmationResolutionLabels: Record<
  MatchConfirmationResolution,
  string
> = {
  PARTIES_AGREED: "As partes concordaram",
  ADMIN_SET_VALUE: "Valor definido pelo suporte",
  ADMIN_COULD_NOT_CONFIRM: "Suporte não conseguiu confirmar",
};

/** Categorias padrão sugeridas ao criar uma skill — espelha AdminController (Thymeleaf) :: DEFAULT_SKILL_CATEGORIES. */
export const defaultSkillCategories = [
  "Backend",
  "Frontend",
  "Mobile",
  "DevOps",
  "Database",
  "Data",
  "API",
] as const;
