/**
 * Espelha 1:1 os DTOs reais do backend
 * (nexus/src/main/java/com/main/nexus/dto/*.java). Não adicione campo aqui
 * sem checar o DTO Java correspondente.
 */

import type { CompanyType } from "./company";

export type UserRole = "PROFESSIONAL" | "COMPANY" | "ADMIN";

/** Espelha com.main.nexus.model.enums.OpportunityType. */
export type OpportunityType = "PROJECT" | "JOB";

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
  token: string;
}

/** Claims que a gente de fato lê do JWT (ver TokenService#generateToken). */
export interface SessionClaims {
  id: number;
  email: string;
  role: UserRole;
}

/**
 * O que POST /api/auth/login devolve pro client — LoginResponseDTO menos o
 * `token` (esse fica só no cookie httpOnly, nunca chega no browser).
 */
export interface SessionSummary {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Espelha com.main.nexus.dto.RegisterProfessionalRequestDTO. Só email,
 * password e name são obrigatórios no backend (ver
 * AuthService#registerProfessional) — o resto é opcional, completável depois
 * no perfil.
 */
export interface RegisterProfessionalRequestDTO {
  email: string;
  password: string;
  name: string;
  phone: string | null;
  cep: string | null;
  preferredOpportunityTypes: OpportunityType[] | null;
  expectedSalaryCLT: number | null;
  expectedSalaryPJ: number | null;
  freelanceMinExpectation: number | null;
  freelanceMaxExpectation: number | null;
  // Consentimento LGPD. acceptedTermsOfUse é obrigatório (true) — o backend
  // rejeita o cadastro com 400 sem ele. Os outros dois são opcionais.
  acceptedTermsOfUse: boolean;
  acceptedMarketingCommunications: boolean;
  acceptedAlgorithmImprovement: boolean;
}

/**
 * Espelha com.main.nexus.dto.RegisterCompanyRequestDTO. Só email, password e
 * companyName são obrigatórios (ver AuthService#registerCompany).
 */
export interface RegisterCompanyRequestDTO {
  email: string;
  password: string;
  companyName: string;
  taxId: string | null;
  phone: string | null;
  cep: string | null;
  description: string | null;
  type: CompanyType;
  // Consentimento LGPD (ver RegisterProfessionalRequestDTO).
  acceptedTermsOfUse: boolean;
  acceptedMarketingCommunications: boolean;
  acceptedAlgorithmImprovement: boolean;
}

/** Espelha com.main.nexus.dto.RegisterCompanyLinkedInRequestDTO. */
export interface RegisterCompanyLinkedInRequestDTO {
  ticket: string;
  companyName: string;
  taxId: string | null;
  phone: string | null;
  cep: string | null;
  description: string | null;
  type: CompanyType;
  // Consentimento LGPD (ver RegisterProfessionalRequestDTO).
  acceptedTermsOfUse: boolean;
  acceptedMarketingCommunications: boolean;
  acceptedAlgorithmImprovement: boolean;
}
