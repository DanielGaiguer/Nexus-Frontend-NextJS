import type { StatusMatch } from "./match";
import type { ScoreBreakdownDTO } from "./match";
import type { ExperienceLevel } from "./professional";
import type { ScreeningInvitationSummaryDTO } from "./screening";

/** Espelha com.main.nexus.dto.CandidateComparisonRequestDTO. */
export interface CandidateComparisonRequestDTO {
  projectId: number;
  matchIds: number[];
}

/** Espelha com.main.nexus.dto.CandidateComparisonItemDTO. */
export interface CandidateComparisonItemDTO {
  matchId: number;
  professionalId: number;
  name: string;
  city: string | null;
  state: string | null;
  profilePhotoUrl: string | null;
  experienceLevel: ExperienceLevel | null;
  reputation: number | null;
  confidenceScore: number | null;
  totalReviews: number | null;
  minimumSalary: number | null;
  maximumSalary: number | null;
  skills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  previousProjectsCount: number | null;
  available: boolean | null;
  matchStatus: StatusMatch;
  scoreBreakdown: ScoreBreakdownDTO | null;
  screeningInvitations: ScreeningInvitationSummaryDTO[];
}

/** Espelha com.main.nexus.dto.CandidateComparisonResponseDTO. */
export interface CandidateComparisonResponseDTO {
  projectId: number;
  projectTitle: string;
  requiredSkills: string[];
  workMode: string | null;
  experienceLevelRequired: string | null;
  opportunityType: string;
  minimumBudget: number | null;
  maximumBudget: number | null;
  monthlySalaryMin: number | null;
  monthlySalaryMax: number | null;
  candidates: CandidateComparisonItemDTO[];
}
