/**
 * Espelha os DTOs de documento legal / consentimento do backend
 * (com.main.nexus.dto.LegalDocument*DTO, ConsentStatusDTO, ...).
 *
 * ⚠️ O conteúdo de /terms e /privacy servido por estes endpoints é uma MINUTA
 * e precisa de revisão jurídica antes de qualquer uso real.
 */

/** Slug de rota pública — espelha LegalDocumentType.slug() no backend. */
export type LegalDocumentSlug = "terms" | "privacy";

/** Espelha com.main.nexus.dto.LegalDocumentDTO. */
export interface LegalDocumentDTO {
  id: number;
  type: "TERMS_OF_USE" | "PRIVACY_POLICY";
  slug: LegalDocumentSlug;
  version: number;
  title: string;
  content: string;
  summaryOfChanges: string | null;
  active: boolean;
  publishedAt: string;
  publishedByAdminEmail: string | null;
}

/** Espelha com.main.nexus.dto.LegalDocumentVersionDTO (lista, sem conteúdo). */
export interface LegalDocumentVersionDTO {
  id: number;
  type: "TERMS_OF_USE" | "PRIVACY_POLICY";
  slug: LegalDocumentSlug;
  version: number;
  title: string;
  summaryOfChanges: string | null;
  active: boolean;
  publishedAt: string;
  publishedByAdminEmail: string | null;
}

/** Espelha com.main.nexus.dto.ConsentStatusDTO. */
export interface ConsentStatusDTO {
  mustReacceptTerms: boolean;
  activeTermsVersion: number | null;
  acceptedTermsVersion: number | null;
  termsSummaryOfChanges: string | null;
  activePrivacyVersion: number | null;
  marketingConsent: boolean;
  algorithmImprovementConsent: boolean;
}

/** Corpo do POST /api/legal/consent/reaccept. */
export interface ReacceptConsentBody {
  acceptedTermsOfUse: boolean;
  acceptedMarketingCommunications: boolean | null;
  acceptedAlgorithmImprovement: boolean | null;
}

/** Espelha com.main.nexus.dto.AdminLegalOverviewDTO. */
export interface AdminLegalOverviewDTO {
  termsOfUse: AdminLegalTypeView;
  privacyPolicy: AdminLegalTypeView;
}

export interface AdminLegalTypeView {
  type: "TERMS_OF_USE" | "PRIVACY_POLICY";
  slug: LegalDocumentSlug;
  active: LegalDocumentDTO | null;
  history: LegalDocumentVersionDTO[];
}

/** Corpo do POST /api/admin/legal-documents/{slug}/versions. */
export interface PublishLegalDocumentBody {
  content: string;
  summaryOfChanges: string | null;
}
