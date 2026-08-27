import type { OpportunityType } from "./auth";
import type { MatchResponseDTO } from "./match";
import type { ProjectResponseDTO } from "./project";
import type { PendingReviewDTO, PendingStatusCheckDTO } from "./review";

/** Espelha com.main.nexus.model.enums.CompanyType. */
export type CompanyType = "LEGAL_ENTITY" | "INDIVIDUAL";

/** Espelha com.main.nexus.dto.CompanyProfileDTO. */
export interface CompanyProfileDTO {
  id: number;
  companyName: string;
  email: string;
  taxId: string | null;
  phone: string | null;
  city: string | null;
  uf: string | null;
  cep: string | null;
  description: string | null;
  reputation: number | null;
  latitude: number | null;
  longitude: number | null;
  /** String crua do enum CompanyStatus do backend (ex.: "PENDING", "APPROVED"). */
  status: string;
  profilePhotoUrl: string | null;
  linkedinUrl: string | null;
  type: CompanyType;
}

/** Espelha com.main.nexus.dto.CompanyDashboardDTO. */
export interface CompanyDashboardDTO {
  company: CompanyProfileDTO;
  totalProjects: number;
  totalMatches: number;
}

/**
 * Payload agregado de `GET /api/company/dashboard/bundle` — junta numa
 * única ida ao servidor tudo que a tela `/company/dashboard` precisa, que
 * antes eram ~7 requests separados do browser (cada um recompilado à parte
 * no `next dev` e cada um um duplo hop browser -> Route Handler -> Spring,
 * incluindo os dois endpoints lentos `matches/confirmed` e `previous`). O
 * Route Handler faz o fan-out server-side em paralelo (`Promise.all`) e o
 * hook `useCompanyDashboardBundle` semeia o cache de cada query individual
 * pra o resto do app (header, sidebar, diálogos, outras telas) continuar
 * reaproveitando sem refetch.
 */
export interface CompanyDashboardBundleDTO {
  profile: CompanyProfileDTO;
  summary: CompanyDashboardDTO;
  projects: ProjectResponseDTO[];
  confirmedMatches: MatchResponseDTO[];
  previousMatches: MatchResponseDTO[];
  pendingStatusCheck: PendingStatusCheckDTO | null;
  pendingReview: PendingReviewDTO | null;
}

/** Espelha com.main.nexus.dto.ReputationExplanationDTO. */
export interface ReputationExplanationDTO {
  overallScore: number | null;
  confidencePercent: number | null;
  totalReviews: number | null;
  technicalCompetence: number | null;
  communication: number | null;
  reliability: number | null;
  punctuality: number | null;
  professionalism: number | null;
  satisfactionAverage: number | null;
  recommendationRate: number | null;
}

/** Espelha com.main.nexus.dto.CompanyPreviousProjectDTO. */
export interface CompanyPreviousProjectDTO {
  id: number;
  projectId: number;
  projectTitle: string;
  opportunityType: OpportunityType;
  completedAt: string;
}

/**
 * Espelha com.main.nexus.dto.PublicCompanyDTO — o perfil de empresa como
 * qualquer outro papel enxerga (embutido em ProjectResponseDTO.company,
 * usado no diretório e na página pública de empresa).
 */
export interface PublicCompanyDTO {
  id: number;
  companyName: string;
  description: string | null;
  city: string | null;
  uf: string | null;
  reputation: number | null;
  profilePhotoUrl: string | null;
  reputationDetails: ReputationExplanationDTO | null;
  taxId: string | null;
  status: string;
  previousProjects: CompanyPreviousProjectDTO[];
  contactEmail: string | null;
  type: CompanyType;
}

/** Espelha com.main.nexus.dto.CompanyDirectoryItemDTO. */
export interface CompanyDirectoryItemDTO {
  id: number;
  companyName: string;
  city: string | null;
  uf: string | null;
  reputation: number | null;
  profilePhotoUrl: string | null;
  description: string | null;
  type: CompanyType;
}

/** Espelha com.main.nexus.dto.CompanyDirectoryPageDTO. */
export interface CompanyDirectoryPageDTO {
  content: CompanyDirectoryItemDTO[];
  hasMore: boolean;
}
