import type { OpportunityType } from "./auth";

/** Espelha com.main.nexus.dto.MatchSummaryDTO. */
export interface MatchSummaryDTO {
  totalMatches: number;
  confirmedMatches: number;
  pendingMatches: number;
  rejectedMatches: number;
  overallAcceptanceRate: number;
}

/** Espelha com.main.nexus.dto.MonthlyMatchDTO. */
export interface MonthlyMatchDTO {
  year: number;
  month: number;
  monthLabel: string;
  totalMatches: number;
  confirmedMatches: number;
  rejectedMatches: number;
}

/** Espelha com.main.nexus.dto.ScoreDistributionDTO. */
export interface ScoreDistributionDTO {
  /** Faixa textual: "0-20", "20-40", "40-60", "60-80", "80-100". */
  range: string;
  count: number;
  percentage: number;
}

/** Espelha com.main.nexus.dto.CompanyAcceptanceRateDTO (dashboard do profissional). */
export interface CompanyAcceptanceRateDTO {
  companyId: number;
  companyName: string;
  totalMatches: number;
  confirmedMatches: number;
  rejectedMatches: number;
  acceptanceRate: number;
}

/** Espelha com.main.nexus.dto.ProjectAcceptanceRateDTO (dashboard da empresa). */
export interface ProjectAcceptanceRateDTO {
  projectId: number;
  projectTitle: string;
  opportunityType: OpportunityType;
  totalMatches: number;
  confirmedMatches: number;
  rejectedMatches: number;
  acceptanceRate: number;
}

/** Espelha com.main.nexus.dto.SkillDemandDTO. */
export interface SkillDemandDTO {
  skillName: string;
  category: string | null;
  projectCount: number;
}

/** Espelha com.main.nexus.dto.ReputationSummaryDTO. */
export interface ReputationSummaryDTO {
  overallReputation: number | null;
  confidenceScore: number | null;
  totalReviews: number | null;
  satisfactionAverage: number | null;
  recommendationRate: number | null;
  communication: number | null;
  reliability: number | null;
  punctuality: number | null;
  professionalism: number | null;
}

/** Espelha com.main.nexus.dto.SkillGapDTO (só existe no dashboard do profissional). */
export interface SkillGapDTO {
  skillName: string;
  category: string | null;
  frequency: number;
}

/** Espelha com.main.nexus.dto.SoftSkillFeedbackDTO. */
export interface SoftSkillFeedbackDTO {
  reason: string;
  enumValue: string;
  count: number;
}

/** Espelha com.main.nexus.dto.ProjectStatusDistributionDTO (só no dashboard da empresa). */
export interface ProjectStatusDistributionDTO {
  status: string;
  enumValue: string;
  count: number;
}

/** Espelha com.main.nexus.dto.ProfessionalDashboardAnalyticsDTO. */
export interface ProfessionalDashboardAnalyticsDTO {
  matchSummary: MatchSummaryDTO;
  matchesPerMonth: MonthlyMatchDTO[];
  scoreDistribution: ScoreDistributionDTO[];
  acceptanceRatePerCompany: CompanyAcceptanceRateDTO[];
  mostRequiredSkills: SkillDemandDTO[];
  reputationSummary: ReputationSummaryDTO;
  skillGaps: SkillGapDTO[];
  softSkillFeedback: SoftSkillFeedbackDTO[];
}

/** Espelha com.main.nexus.dto.CompanyDashboardAnalyticsDTO. */
export interface CompanyDashboardAnalyticsDTO {
  matchSummary: MatchSummaryDTO;
  matchesPerMonth: MonthlyMatchDTO[];
  scoreDistribution: ScoreDistributionDTO[];
  acceptanceRatePerProject: ProjectAcceptanceRateDTO[];
  mostRequiredSkills: SkillDemandDTO[];
  reputationSummary: ReputationSummaryDTO;
  softSkillFeedback: SoftSkillFeedbackDTO[];
  projectStatusDistribution: ProjectStatusDistributionDTO[];
}
