import type { ExperienceLevel } from "./professional";
import type { SkillResponseDTO } from "./skill";

/** Espelha com.main.nexus.model.enums.ProposalStatus. */
export type ProposalStatus =
  "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "EXPIRED";

/** Espelha com.main.nexus.dto.ProposalAttachmentDTO. */
export interface ProposalAttachmentDTO {
  id: number;
  fileUrl: string;
  fileName: string;
}

/**
 * Espelha com.main.nexus.dto.ProposalResponseDTO — carrega os campos brutos da proposta e os
 * campos de comparação (reputação, skills compatíveis, projetos anteriores) já prontos pro card
 * da tela de comparação da empresa, no mesmo formato "flat" usado por CandidateComparisonItemDTO.
 */
export interface ProposalResponseDTO {
  id: number;
  projectId: number;
  projectTitle: string;
  matchId: number | null;

  professionalId: number;
  professionalName: string;
  professionalCity: string | null;
  professionalUf: string | null;
  professionalProfilePhotoUrl: string | null;
  professionalExperienceLevel: ExperienceLevel | null;

  proposedValue: number;
  estimatedDays: number;
  proposedStartDate: string | null;
  proposedDeliveryDate: string | null;
  description: string;
  relevantExperience: string | null;
  skills: SkillResponseDTO[];
  deliverables: string | null;
  executionSteps: string[];
  paymentTerms: string | null;
  validityDays: number;
  expiresAt: string;
  questionsForCompany: string | null;
  attachments: ProposalAttachmentDTO[];

  status: ProposalStatus;
  matchScoreAtSubmission: number;
  autoRejectedPositionFilled: boolean;
  createdAt: string;
  updatedAt: string | null;

  /** Nota 1-5 (Professional.reputation) — não o score 0-100 do motor de match. */
  reputationScore: number | null;
  totalReviews: number;
  previousProjectsCount: number;
  matchingSkills: string[];
  missingSkills: string[];
}

/** Espelha com.main.nexus.dto.ProposalRequestDTO. */
export interface ProposalRequestDTO {
  projectId: number;
  proposedValue: number;
  estimatedDays: number;
  proposedStartDate: string | null;
  proposedDeliveryDate: string | null;
  description: string;
  relevantExperience: string | null;
  skillIds: number[];
  deliverables: string | null;
  executionSteps: string[];
  paymentTerms: string | null;
  validityDays: number;
  questionsForCompany: string | null;
}

/** Rótulos em português para ProposalStatus — usados nos badges de status do card. */
export const proposalStatusLabels: Record<ProposalStatus, string> = {
  PENDING: "Aguardando resposta",
  ACCEPTED: "Aceita",
  REJECTED: "Recusada",
  WITHDRAWN: "Retirada",
  EXPIRED: "Expirada",
};
