/**
 * Espelha os DTOs da camada de cobrança (com.main.nexus.dto.Billing* /
 * CommissionChargeDTO). Valores monetários são BigDecimal serializados como
 * número; datas chegam como String ISO.
 */

/** Espelha com.main.nexus.model.enums.CommissionChargeStatus. */
export type CommissionChargeStatus =
  "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELED";

/** Espelha com.main.nexus.model.enums.PaymentBlockReason. */
export type PaymentBlockReason = "NO_CARD_ON_FILE" | "CHARGE_DECLINED";

/** Espelha com.main.nexus.dto.BillingConfigDTO. */
export interface BillingConfigDTO {
  enabled: boolean;
  publicKey: string;
  /** true = modo simulado (sem Mercado Pago) -> "cartão de teste" no lugar do SDK. */
  simulated: boolean;
}

/** Espelha com.main.nexus.dto.BillingModeDTO (painel do Admin). */
export interface BillingModeDTO {
  live: boolean;
  simulated: boolean;
}

/** Espelha com.main.nexus.dto.BillingStatusDTO. */
export interface BillingStatusDTO {
  billingEnabled: boolean;
  hasCard: boolean;
  cardBrand: string | null;
  cardLast4: string | null;
  cardExpMonth: number | null;
  cardExpYear: number | null;
  cardholderName: string | null;
  blocked: boolean;
  blockReason: PaymentBlockReason | null;
  blockMessage: string | null;
  pendingChargeId: number | null;
  pendingChargeAmount: number | null;
  pendingChargeStatus: CommissionChargeStatus | null;
}

/** Espelha com.main.nexus.dto.CommissionChargeDTO. */
export interface CommissionChargeDTO {
  id: number;
  matchId: number;
  companyId: number;
  companyName: string;
  projectTitle: string;
  professionalName: string;
  baseAmount: number;
  percentage: number;
  amount: number;
  status: CommissionChargeStatus;
  mpPaymentId: string | null;
  mpStatusDetail: string | null;
  failureReason: string | null;
  attempts: number;
  createdAt: string;
  paidAt: string | null;
}

/** Corpo de POST /api/company/billing/card. */
export interface SaveCardBody {
  cardToken: string;
}

export const commissionChargeStatusLabels: Record<
  CommissionChargeStatus,
  string
> = {
  PENDING: "Aguardando cobrança",
  PROCESSING: "Processando",
  PAID: "Paga",
  FAILED: "Recusada",
  CANCELED: "Cancelada",
};
