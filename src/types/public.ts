import type { ReputationExplanationDTO } from "./company";
import type {
  ExperienceLevel,
  ProfessionalCredentialDTO,
} from "./professional";

/** Espelha com.main.nexus.dto.PublicProjectDTO (item de portfólio, visão pública). */
export interface PublicProjectDTO {
  title: string;
  technologies: string[];
  yearOfCompletion: number | null;
}

/**
 * Espelha com.main.nexus.dto.PublicProfessionalDTO — perfil público de um
 * profissional (GET /api/public/professional/{id}), inclusive usado pela
 * própria página de perfil pra pegar o breakdown de reputação
 * (reputationDetails), que não vem no ProfessionalProfileDTO "privado".
 */
export interface PublicProfessionalDTO {
  id: number;
  name: string;
  city: string | null;
  uf: string | null;
  experienceLevel: ExperienceLevel | null;
  reputation: number | null;
  available: boolean | null;
  skills: string[];
  previousProjects: PublicProjectDTO[];
  overallScore: number | null;
  reputationDetails: ReputationExplanationDTO | null;
  profilePhotoUrl: string | null;
  minimumSalary: number | null;
  maximumSalary: number | null;
  preferredTypes: string[];
  githubUrl: string | null;
  githubLogin: string | null;
  hasGitHub: boolean;
  credentials: ProfessionalCredentialDTO[];
}
