/**
 * Gestão de membros de uma conta empresarial (Prompt 4 do backend —
 * CompanyMemberController / CompanyMemberService). Espelha 1:1 os DTOs Java.
 */

export type CompanyRole = "OWNER" | "MEMBER";

/** Espelha com.main.nexus.dto.CompanyMemberDTO. `id` é o id do CompanyMember. */
export interface CompanyMemberDTO {
  id: number;
  userId: number;
  email: string;
  role: CompanyRole;
  joinedAt: string;
}

/** Espelha com.main.nexus.dto.CompanyInvitationDTO. */
export interface CompanyInvitationDTO {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

/** Espelha com.main.nexus.dto.CompanyMembersResponseDTO. */
export interface CompanyMembersResponseDTO {
  members: CompanyMemberDTO[];
  pendingInvitations: CompanyInvitationDTO[];
}

/** Corpo de POST /api/company/members/invite. */
export interface InviteMemberRequestBody {
  email: string;
}

/** Corpo de POST /api/company/invitations/accept (espelha AcceptCompanyInvitationDTO). */
export interface AcceptInvitationRequestBody {
  token: string;
  password: string;
  acceptedTermsOfUse: boolean;
  acceptedMarketingCommunications: boolean;
  acceptedAlgorithmImprovement: boolean;
}

/**
 * Resposta de GET /api/company/members/role — o papel do usuário logado na
 * conta empresarial, deduzido pelo BFF (o JWT só carrega role="COMPANY", não
 * OWNER/MEMBER). `null` quando não há sessão de empresa.
 */
export interface CompanyRoleResponse {
  role: CompanyRole | null;
}
