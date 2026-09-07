import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  CompanyMembersResponseDTO,
  CompanyRoleResponse,
} from "@/types/members";

export const companyMembersKey = () => ["company", "members"] as const;
export const companyRoleKey = () => ["company", "members", "role"] as const;

/**
 * Membros ACTIVE + convites PENDING da conta empresarial. Endpoint OWNER-only:
 * um MEMBER recebe 403 (o hook não faz retry, e a página trata esse caso
 * mostrando um painel "gerenciado pelo proprietário").
 */
export function useCompanyMembers(enabled = true) {
  return useQuery({
    queryKey: companyMembersKey(),
    queryFn: () => apiFetch<CompanyMembersResponseDTO>("/api/company/members"),
    enabled,
    retry: false,
  });
}

/**
 * Papel do usuário logado na conta (OWNER/MEMBER), deduzido pelo BFF — o JWT só
 * tem role="COMPANY". Usado pra mostrar/esconder as ações exclusivas do OWNER.
 */
export function useCompanyRole() {
  return useQuery({
    queryKey: companyRoleKey(),
    queryFn: () => apiFetch<CompanyRoleResponse>("/api/company/members/role"),
    staleTime: 60_000,
    retry: false,
  });
}
