import { useMutation, useQueryClient } from "@tanstack/react-query";

import { companyProfileKey } from "@/hooks/queries/useCompanyProfile";
import {
  companyMembersKey,
  companyRoleKey,
} from "@/hooks/queries/useCompanyMembers";
import { apiFetch } from "@/lib/api-client";
import type {
  AcceptInvitationRequestBody,
  CompanyInvitationDTO,
  InviteMemberRequestBody,
} from "@/types/members";
import type { SessionSummary } from "@/types/auth";

function useInvalidateMembers() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: companyMembersKey() });
    queryClient.invalidateQueries({ queryKey: companyRoleKey() });
  };
}

export function useInviteMember() {
  const invalidate = useInvalidateMembers();
  return useMutation({
    mutationFn: (body: InviteMemberRequestBody) =>
      apiFetch<CompanyInvitationDTO>("/api/company/members/invite", {
        method: "POST",
        body,
      }),
    onSuccess: invalidate,
  });
}

export function useRemoveMember() {
  const invalidate = useInvalidateMembers();
  return useMutation({
    mutationFn: (memberId: number) =>
      apiFetch<{ message: string }>(`/api/company/members/${memberId}`, {
        method: "DELETE",
      }),
    onSuccess: invalidate,
  });
}

export function useTransferOwnership() {
  const invalidate = useInvalidateMembers();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: number) =>
      apiFetch<{ message: string }>(
        `/api/company/members/${memberId}/transfer-ownership`,
        { method: "POST" }
      ),
    onSuccess: () => {
      invalidate();
      // O e-mail de contato do perfil (Company.user) passa a ser o do novo dono.
      queryClient.invalidateQueries({ queryKey: companyProfileKey() });
    },
  });
}

export function useRevokeInvitation() {
  const invalidate = useInvalidateMembers();
  return useMutation({
    mutationFn: (invitationId: number) =>
      apiFetch<{ message: string }>(
        `/api/company/invitations/${invitationId}`,
        { method: "DELETE" }
      ),
    onSuccess: invalidate,
  });
}

/** Aceite de convite — cria a conta do membro e planta a sessão (cookie no BFF). */
export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (body: AcceptInvitationRequestBody) =>
      apiFetch<SessionSummary>("/api/company/invitations/accept", {
        method: "POST",
        body,
      }),
  });
}
