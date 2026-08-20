import type { ContractType, Modality } from "./project";
import type { ExperienceLevel, ProjectType } from "./professional";

/** Espelha com.main.nexus.dto.MapProfessionalDTO. */
export interface MapProfessionalDTO {
  id: number;
  name: string;
  city: string | null;
  uf: string | null;
  latitude: number;
  longitude: number;
  reputation: number | null;
  experienceLevel: ExperienceLevel | null;
  skills: string[];
}

/** Espelha com.main.nexus.dto.MapCompanyDTO. */
export interface MapCompanyDTO {
  id: number;
  companyName: string;
  city: string | null;
  uf: string | null;
  latitude: number;
  longitude: number;
  reputation: number | null;
  openProjects: number;
}

/** Espelha com.main.nexus.dto.MapOpportunityDTO. */
export interface MapOpportunityDTO {
  id: number;
  /** "JOB" | "PROJECT", cru como String no backend. */
  opportunityType: string;
  title: string;
  companyName: string;
  city: string;
  uf: string;
  latitude: number;
  longitude: number;
  workMode: Modality | null;
  requiredSkills: string[];
  experienceLevel: ExperienceLevel | null;
  projectType: ProjectType | null;
  contractType: ContractType | null;
  monthlySalaryMin: number | null;
  monthlySalaryMax: number | null;
  minimumBudget: number | null;
  maximumBudget: number | null;
  createdAt: string;
}
