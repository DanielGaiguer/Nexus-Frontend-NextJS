/**
 * Espelha os DTOs do painel financeiro (Prompt 7):
 * com.main.nexus.dto.ContractorFinanceOverviewDTO / AdminFinanceOverviewDTO /
 * AwaitingConfirmationDTO / MonthlyAmountDTO. Valores monetários são BigDecimal
 * serializados como número; datas chegam como String ISO.
 */

/** Espelha com.main.nexus.dto.MonthlyAmountDTO. */
export interface MonthlyAmountDTO {
  label: string;
  value: number;
}

/** Espelha com.main.nexus.dto.AwaitingConfirmationDTO. */
export interface AwaitingConfirmationDTO {
  matchId: number;
  projectTitle: string;
  professionalName: string;
  openedAt: string;
  deadline: string;
  suggestedAmount: number | null;
  estimatedCommission: number | null;
}

/** Espelha com.main.nexus.dto.ContractorFinanceOverviewDTO. */
export interface ContractorFinanceOverviewDTO {
  commissionEnabled: boolean;
  simulated: boolean;
  totalPaid: number;
  paidCount: number;
  totalPending: number;
  pendingCount: number;
  blocked: boolean;
  blockMessage: string | null;
  awaitingConfirmationCount: number;
  awaitingConfirmationEstimated: number;
  freeHiresLimit: number;
  usedFreeHires: number;
  freeHiresRemaining: number;
  commissionApplies: boolean;
  commissionPercentage: number;
  invoicesIssuedCount: number;
  invoicesPendingCount: number;
  awaitingConfirmations: AwaitingConfirmationDTO[];
  // Mensalidades da plataforma personalizada (origem separada da comissão).
  portalHasSubscription: boolean;
  portalTotalPaid: number;
  portalPaidCount: number;
  portalTotalPending: number;
  portalPendingCount: number;
}

/** Espelha com.main.nexus.dto.AdminFinanceOverviewDTO. */
export interface AdminFinanceOverviewDTO {
  commissionLive: boolean;
  simulated: boolean;
  grossRevenue: number;
  paidCount: number;
  pendingRevenue: number;
  pendingCount: number;
  failedChargeCount: number;
  blockedCompaniesCount: number;
  pendingReconciliationCount: number;
  pendingNfseCount: number;
  issuedNfseCount: number;
  commissionPercentage: number;
  freeHiresLimit: number;
  monthlyRevenue: MonthlyAmountDTO[];
  // Mensalidades da plataforma personalizada (origem separada da comissão).
  portalGrossRevenue: number;
  portalPaidCount: number;
  portalPendingRevenue: number;
  portalPendingCount: number;
}
