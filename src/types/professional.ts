import type { OpportunityType } from "./auth";

/** Espelha com.main.nexus.model.enums.ExperienceLevel. */
export type ExperienceLevel =
  "INTERNSHIP" | "TRAINEE" | "JUNIOR" | "PLENO" | "SENIOR";

/** Espelha com.main.nexus.model.enums.ProjectType. */
export type ProjectType = "FREELANCE" | "FULL_TIME" | "PART_TIME";

/** Espelha com.main.nexus.model.enums.CredentialType. */
export type CredentialType = "CERTIFICATE" | "EVENT";

/** Espelha com.main.nexus.model.enums.BadgeColor. */
export type BadgeColor =
  | "NEXUS"
  | "SLATE"
  | "CIANO"
  | "VIOLETA"
  | "TEAL"
  | "AMBAR"
  | "ROSA"
  | "ESMERALDA";

/** Espelha com.main.nexus.dto.ProfessionalCredentialDTO. */
export interface ProfessionalCredentialDTO {
  id: number;
  type: CredentialType;
  name: string;
  color: BadgeColor;
}

/** Espelha com.main.nexus.dto.ProfessionalProfileDTO. */
export interface ProfessionalProfileDTO {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  available: boolean | null;
  reputation: number | null;
  latitude: number | null;
  longitude: number | null;
  skills: string[];
  preferredTypes: ProjectType[];
  experienceLevel: ExperienceLevel | null;
  profilePhotoUrl: string | null;

  preferredOpportunityTypes: OpportunityType[];
  expectedSalaryCLT: number | null;
  expectedSalaryPJ: number | null;
  freelanceMinExpectation: number | null;
  freelanceMaxExpectation: number | null;

  profileComplete: boolean;
  missingFields: string[];

  linkedinUrl: string | null;
  resume: string | null;

  githubUrl: string | null;
  githubLogin: string | null;
  hasGitHub: boolean;

  credentials: ProfessionalCredentialDTO[];
}
