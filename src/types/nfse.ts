/**
 * Espelha os DTOs da emissão de NFS-e por comissão (com.main.nexus.dto.Fiscal* /
 * CompanyFiscalProfileDTO / NfseInvoiceDTO / NfseModeDTO). Valores monetários são
 * BigDecimal serializados como número; datas chegam como String ISO.
 */

/** Espelha com.main.nexus.model.enums.NfseInvoiceStatus. */
export type NfseInvoiceStatus =
  "PENDING" | "PROCESSING" | "ISSUED" | "FAILED" | "CANCELED";

/** Espelha com.main.nexus.dto.FiscalConfigDTO (tela do Admin). */
export interface FiscalConfigDTO {
  enotasEmpresaId: string | null;
  defaultServiceDescription: string | null;
  /** true = api-key do eNotas + empresaId presentes, ou modo simulate. */
  nfseEnabled: boolean;
  /** true = modo simulado (sem eNotas). */
  simulated: boolean;
  updatedAt: string | null;
  updatedByAdminEmail: string | null;
}

/** Corpo de PUT /api/admin/fiscal-config. */
export interface UpdateFiscalConfigBody {
  enotasEmpresaId: string;
  defaultServiceDescription: string;
}

/** Espelha com.main.nexus.dto.CompanyFiscalProfileDTO. */
export interface CompanyFiscalProfileDTO {
  taxId: string | null;
  companyType: "INDIVIDUAL" | "LEGAL_ENTITY" | null;
  companyName: string | null;
  city: string | null;
  uf: string | null;
  cep: string | null;
  legalName: string | null;
  fiscalEmail: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  cityIbgeCode: string | null;
  /** "completo o suficiente para emitir" — calculado no backend. */
  complete: boolean;
}

/** Corpo de PUT /api/company/billing/fiscal-profile. */
export interface UpdateCompanyFiscalProfileBody {
  legalName: string;
  fiscalEmail: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  cityIbgeCode: string;
}

/** Espelha com.main.nexus.dto.NfseInvoiceDTO. */
export interface NfseInvoiceDTO {
  id: number;
  chargeId: number;
  /** null quando a NFS-e é de uma mensalidade de plataforma (não de comissão). */
  matchId: number | null;
  companyId: number;
  companyName: string;
  /** Título do projeto (comissão) ou "Plataforma personalizada — <sub>". */
  projectTitle: string;
  /** null para NFS-e de mensalidade de plataforma. */
  professionalName: string | null;
  amount: number;
  status: NfseInvoiceStatus;
  numero: string | null;
  linkPdf: string | null;
  linkXml: string | null;
  failureReason: string | null;
  attempts: number;
  createdAt: string;
  issuedAt: string | null;
}

/** Espelha com.main.nexus.dto.NfseModeDTO (painel do Admin). */
export interface NfseModeDTO {
  live: boolean;
  simulated: boolean;
}

export const nfseInvoiceStatusLabels: Record<NfseInvoiceStatus, string> = {
  PENDING: "Aguardando emissão",
  PROCESSING: "Processando",
  ISSUED: "Emitida",
  FAILED: "Falhou",
  CANCELED: "Cancelada",
};
