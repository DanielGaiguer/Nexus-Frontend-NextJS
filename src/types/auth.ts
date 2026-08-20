/**
 * Espelha 1:1 os DTOs reais do backend
 * (nexus/src/main/java/com/main/nexus/dto/{LoginRequestDTO,LoginResponseDTO,UserDTO}.java).
 * Não adicione campo aqui sem checar o DTO Java correspondente.
 */

export type UserRole = "PROFESSIONAL" | "COMPANY" | "ADMIN";

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
