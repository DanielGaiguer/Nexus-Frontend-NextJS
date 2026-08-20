/** Espelha com.main.nexus.dto.MonthlyMatchCountDTO. */
export interface MonthlyMatchCountDTO {
  label: string;
  value: number;
}

/** Espelha com.main.nexus.dto.AdminDashboardDTO. */
export interface AdminDashboardDTO {
  totalUsers: number;
  totalProfessionals: number;
  totalCompanies: number;
  totalProjects: number;
  totalOpenProjects: number;
  totalMatches: number;
  totalConfirmedMatches: number;
  /** % de matches que chegaram a MATCHED em relação ao total de matches existentes. */
  matchConversionRate: number;
  pendingCompanies: number;
  /** Matches por mês dos últimos 12 meses, todo o sistema. */
  monthlyMatches: MonthlyMatchCountDTO[];
}

/** Espelha com.main.nexus.dto.UserSummaryDTO. */
export interface UserSummaryDTO {
  id: number;
  name: string;
  email: string;
  type: "PROFESSIONAL" | "COMPANY" | "ADMIN";
  active: boolean;
  profilePhotoUrl: string | null;
}

/** Espelha com.main.nexus.dto.RejectCompanyRequestDTO. */
export interface RejectCompanyRequestDTO {
  reason: string;
}

/** Espelha com.main.nexus.dto.SkillRequestDTO. */
export interface SkillRequestDTO {
  name: string;
  category: string;
}

/**
 * GET /api/admin/skills devolve a entidade `Skill` crua (não um DTO) —
 * espelhado aqui com os campos que ela de fato serializa.
 */
export interface AdminSkillDTO {
  id: number;
  name: string;
  category: string;
  active: boolean;
}

/** Espelha com.main.nexus.dto.ProfessionalDashboardDTO (visão do admin sobre um profissional). */
export interface ProfessionalDashboardDTO {
  professional: import("./professional").ProfessionalProfileDTO;
  totalProjects: number;
  totalMatches: number;
}

/** Categorias padrão sugeridas ao criar uma skill — espelha AdminController (Thymeleaf) :: DEFAULT_SKILL_CATEGORIES. */
export const defaultSkillCategories = [
  "Backend",
  "Frontend",
  "Mobile",
  "DevOps",
  "Database",
  "Data",
  "API",
] as const;
