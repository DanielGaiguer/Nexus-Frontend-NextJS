/**
 * Espelha os DTOs de plataforma personalizada do backend
 * (com.main.nexus.dto.CustomPortal*). Datas chegam como String ISO
 * (LocalDate → "2026-08-27", LocalDateTime → "2026-08-27T12:00:00");
 * planPrice é BigDecimal serializado como número.
 */

/** Espelha com.main.nexus.model.enums.CustomPortalRequestStatus. */
export type CustomPortalRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Espelha com.main.nexus.model.enums.CustomPortalStatus. */
export type CustomPortalStatus = "ACTIVE" | "SUSPENDED" | "CANCELED";

/** Espelha com.main.nexus.model.enums.CustomPortalPaymentStatus. */
export type CustomPortalPaymentStatus = "UP_TO_DATE" | "OVERDUE" | "CANCELED";

/** Espelha com.main.nexus.model.enums.BrandingImageKind. */
export type BrandingImageKind = "LOGO" | "BANNER" | "FAVICON";

/** Espelha com.main.nexus.dto.CustomPortalSectionDTO — seção institucional extra (ordem = posição). */
export interface CustomPortalSectionDTO {
  title: string;
  content: string | null;
}

/** Espelha com.main.nexus.dto.SocialLinksDTO — links de redes sociais do rodapé. */
export interface PortalSocialLinks {
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  x: string | null;
  github: string | null;
}

/** Espelha com.main.nexus.dto.CustomPortalRequestDTO. */
export interface CustomPortalRequestDTO {
  id: number;
  companyId: number;
  companyName: string;
  companyEmail: string | null;
  requestedAt: string;
  message: string | null;
  /** String crua do enum CustomPortalRequestStatus. */
  status: CustomPortalRequestStatus;
  reviewedByEmail: string | null;
  reviewedAt: string | null;
  decisionReason: string | null;
}

/** Espelha com.main.nexus.dto.CustomPortalDTO. */
export interface CustomPortalDTO {
  id: number;
  companyId: number;
  companyName: string;
  companyEmail: string | null;
  status: CustomPortalStatus;
  subdomain: string;
  planName: string;
  planPrice: number;
  subscriptionStartDate: string;
  nextDueDate: string;
  paymentStatus: CustomPortalPaymentStatus;
  /** true quando o portal nasceu de uma solicitação; false quando o Admin criou direto. */
  createdFromRequest: boolean;
  createdAt: string;
  updatedAt: string;
  // ── customização visual (Prompt 2) — tudo pode vir null/vazio ──
  displayName: string | null;
  primaryColor: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  faviconUrl: string | null;
  aboutText: string | null;
  sections: CustomPortalSectionDTO[];
  socialLinks: PortalSocialLinks;
}

/** Espelha com.main.nexus.dto.CustomPortalStatusHistoryDTO. */
export interface CustomPortalStatusHistoryDTO {
  id: number;
  previousStatus: CustomPortalStatus | null;
  newStatus: CustomPortalStatus;
  changedByEmail: string | null;
  changedAt: string;
  note: string | null;
}

/** Espelha com.main.nexus.dto.CustomPortalDetailDTO. */
export interface CustomPortalDetailDTO {
  portal: CustomPortalDTO;
  originRequest: CustomPortalRequestDTO | null;
  statusHistory: CustomPortalStatusHistoryDTO[];
}

/** Espelha com.main.nexus.dto.CustomPortalOverviewDTO — o que a tela do contratante precisa. */
export interface CustomPortalOverviewDTO {
  latestRequest: CustomPortalRequestDTO | null;
  portal: CustomPortalDTO | null;
  canRequest: boolean;
}

/**
 * Espelha com.main.nexus.dto.PublicCustomPortalDTO — recorte público servido em
 * `empresa.nexus.com.br` (Prompt 3). Sem dados de assinatura. `status` vem junto
 * pra a página decidir entre renderizar (ACTIVE) e "plataforma indisponível".
 */
export interface PublicCustomPortalDTO {
  companyId: number;
  companyName: string;
  subdomain: string;
  status: CustomPortalStatus;
  displayName: string | null;
  primaryColor: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  faviconUrl: string | null;
  aboutText: string | null;
  sections: CustomPortalSectionDTO[];
  socialLinks: PortalSocialLinks;
}

// ── Corpos de request ────────────────────────────────────────────────

export interface CreateCustomPortalRequestBody {
  message?: string;
}

export interface SubscriptionInput {
  subdomain: string;
  planName: string;
  planPrice: number;
  subscriptionStartDate: string;
  nextDueDate: string;
  paymentStatus?: CustomPortalPaymentStatus;
}

/** Corpo de POST /api/admin/custom-portal-requests/{id}/approve. */
export type ApproveCustomPortalRequestBody = SubscriptionInput;

/** Corpo de POST /api/admin/custom-portals (criação direta). */
export interface CreateCustomPortalBody extends SubscriptionInput {
  companyId: number;
}

export interface RejectCustomPortalRequestBody {
  reason: string;
}

export interface UpdateCustomPortalSubscriptionBody {
  planName: string;
  planPrice: number;
  nextDueDate: string;
  paymentStatus?: CustomPortalPaymentStatus;
}

export interface CustomPortalStatusChangeBody {
  note?: string;
}

/** Corpo de PUT .../custom-portal/branding — campos de texto da customização visual. */
export interface UpdateCustomPortalBrandingBody {
  displayName: string | null;
  primaryColor: string | null;
  aboutText: string | null;
  sections: CustomPortalSectionDTO[];
  socialLinks: PortalSocialLinks;
}

// ── Análises / tracking ──────────────────────────────────────────────

/** Espelha com.main.nexus.model.enums.CustomPortalEventType. */
export type CustomPortalEventType = "PAGE_VIEW" | "APPLY_CLICK" | "SESSION_END";

/** Corpo do beacon POST /api/public/custom-portal/{sub}/events. */
export interface TrackPortalEventBody {
  visitorId: string;
  type: CustomPortalEventType;
  path?: string;
  opportunityId?: number | null;
  durationSeconds?: number | null;
  referrerHost?: string | null;
}

/** Espelha com.main.nexus.dto.CustomPortalAnalyticsDTO. */
export interface CustomPortalAnalyticsDTO {
  rangeDays: number;
  totalViews: number;
  uniqueVisitors: number;
  applyClicks: number;
  /** % — applyClicks / totalViews. */
  conversionRate: number;
  /** segundos. */
  avgSessionSeconds: number;
  viewsPerDay: { date: string; views: number }[];
  topOpportunities: { opportunityId: number; title: string; views: number }[];
  referrers: { label: string; count: number }[];
}

/** Espelha com.main.nexus.dto.AdminCustomPortalAnalyticsDTO — dashboard geral do módulo. */
export interface AdminCustomPortalAnalyticsDTO {
  rangeDays: number;
  totalPortals: number;
  activePortals: number;
  suspendedPortals: number;
  canceledPortals: number;
  pendingRequests: number;
  overduePayments: number;
  dueSoon: number;
  /** Soma do preço dos planos das plataformas ativas. */
  monthlyRecurringRevenue: number;
  /** Engajamento agregado de todas as plataformas — mesmo formato do dashboard do contratante. */
  system: CustomPortalAnalyticsDTO;
  portalsByStatus: { status: CustomPortalStatus; count: number }[];
  portalsByPlan: { planName: string; count: number }[];
  topPortals: {
    portalId: number;
    companyName: string;
    subdomain: string;
    status: CustomPortalStatus;
    views: number;
    applyClicks: number;
    conversionRate: number;
  }[];
  portalsCreatedPerMonth: { label: string; count: number }[];
}

// ── Rótulos para a UI ────────────────────────────────────────────────

export const customPortalStatusLabel: Record<CustomPortalStatus, string> = {
  ACTIVE: "Ativa",
  SUSPENDED: "Suspensa",
  CANCELED: "Cancelada",
};

export const customPortalRequestStatusLabel: Record<
  CustomPortalRequestStatus,
  string
> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  REJECTED: "Recusada",
};

export const customPortalPaymentStatusLabel: Record<
  CustomPortalPaymentStatus,
  string
> = {
  UP_TO_DATE: "Em dia",
  OVERDUE: "Atrasado",
  CANCELED: "Cancelado",
};
