import type { OpportunityType } from "./auth";
import type { PublicCompanyDTO } from "./company";
import type { ExperienceLevel, ProjectType } from "./professional";
import type { SkillResponseDTO } from "./skill";

/** Espelha com.main.nexus.model.enums.Modality. */
export type Modality = "ONSITE" | "HYBRID" | "REMOTE";

/** Espelha com.main.nexus.model.enums.ContractType. */
export type ContractType =
  "CLT" | "PJ" | "INTERNSHIP" | "TEMPORARY" | "FREELANCER";

/** Espelha com.main.nexus.model.enums.ProjectStatus. */
export type ProjectStatus = "OPEN" | "PAUSED" | "CLOSED";

/**
 * Espelha com.main.nexus.dto.ProjectResponseDTO. Campos de PROJECT (budget,
 * deadline) e de JOB (salário, contractType, ...) coexistem no mesmo DTO —
 * só um dos dois grupos vem preenchido, conforme `opportunityType`.
 */
export interface ProjectResponseDTO {
  id: number;
  title: string;
  description: string | null;
  workMode: Modality | null;
  experienceLevel: ExperienceLevel | null;
  status: ProjectStatus;
  maxPositions: number | null;
  filledPositions: number | null;
  createdAt: string;
  opportunityType: OpportunityType;
  type: ProjectType | null;
  requiredSkills: SkillResponseDTO[];
  companyId: number;
  companyName: string;

  cep: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  uf: string | null;

  // PROJECT
  minimumBudget: number | null;
  maximumBudget: number | null;
  deadline: string | null;

  // JOB
  monthlySalaryMin: number | null;
  monthlySalaryMax: number | null;
  contractType: ContractType | null;
  benefits: string | null;
  startDate: string | null;
  workloadHoursPerWeek: number | null;

  // Só vêm preenchidos pra dono/ADMIN; demais viewers recebem null aqui e
  // usam salaryVisible pra saber se podem exibir o salário/orçamento.
  visibleToCompanies: boolean | null;
  salaryVisibleToProfessionals: boolean | null;
  salaryVisibleToCompanies: boolean | null;
  salaryVisible: boolean | null;

  company: PublicCompanyDTO | null;
}
