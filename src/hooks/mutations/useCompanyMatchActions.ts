import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  confirmedCompanyMatchesKey,
  previousCompanyMatchesKey,
  receivedInterestsKey,
  rejectedCompanyMatchesKey,
  sentInvitesKey,
} from "@/hooks/queries/useCompanyMatches";
import { myProjectsKey } from "@/hooks/queries/useMyProjects";
import { apiFetch } from "@/lib/api-client";
import type { CompanyRejectRequestDTO } from "@/types/match";

/**
 * As quatro ações que a empresa pode tomar sobre um match
 * (MatchController: company-interest/-accept/-reject/-cancel). Convite
 * (company-interest) é disparado do ranking; as outras três, da tela de
 * matches.
 */
function useInvalidateCompanyMatchLists() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: receivedInterestsKey() });
    queryClient.invalidateQueries({ queryKey: sentInvitesKey() });
    queryClient.invalidateQueries({ queryKey: confirmedCompanyMatchesKey() });
    queryClient.invalidateQueries({ queryKey: rejectedCompanyMatchesKey() });
    queryClient.invalidateQueries({ queryKey: previousCompanyMatchesKey() });
    queryClient.invalidateQueries({ queryKey: myProjectsKey() });
  };
}

export function useCompanyShowInterest() {
  const invalidate = useInvalidateCompanyMatchLists();
  return useMutation({
    mutationFn: (matchId: number) =>
      apiFetch<{ message: string }>(
        `/api/matches/${matchId}/company-interest`,
        {
          method: "POST",
        }
      ),
    onSuccess: invalidate,
  });
}

/**
 * Mesma ação de useCompanyShowInterest, mas pra quando ainda não existe (ou
 * não se sabe se existe) um match — ex.: profissional achado pelo diretório
 * geral (/company/professionals), fora do contexto de um projeto específico.
 * O backend localiza ou cria o match a partir de professionalId+projectId.
 */
export function useCompanyShowInterestByProject() {
  const invalidate = useInvalidateCompanyMatchLists();
  return useMutation({
    mutationFn: ({
      professionalId,
      projectId,
    }: {
      professionalId: number;
      projectId: number;
    }) =>
      apiFetch<{ message: string }>(
        `/api/matches/company-interest-by-project?professionalId=${professionalId}&projectId=${projectId}`,
        { method: "POST" }
      ),
    onSuccess: invalidate,
  });
}

export function useCompanyAcceptMatch() {
  const invalidate = useInvalidateCompanyMatchLists();
  return useMutation({
    mutationFn: (matchId: number) =>
      apiFetch<{ message: string }>(`/api/matches/${matchId}/company-accept`, {
        method: "POST",
      }),
    onSuccess: invalidate,
  });
}

export function useCompanyRejectMatch() {
  const invalidate = useInvalidateCompanyMatchLists();
  return useMutation({
    mutationFn: ({
      matchId,
      ...body
    }: CompanyRejectRequestDTO & { matchId: number }) =>
      apiFetch<{ message: string }>(`/api/matches/${matchId}/company-reject`, {
        method: "POST",
        body,
      }),
    onSuccess: invalidate,
  });
}

export function useCompanyCancelMatch() {
  const invalidate = useInvalidateCompanyMatchLists();
  return useMutation({
    mutationFn: (matchId: number) =>
      apiFetch<{ message: string }>(`/api/matches/${matchId}/company-cancel`, {
        method: "POST",
      }),
    onSuccess: invalidate,
  });
}
