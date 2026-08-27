import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  confirmedCompanyMatchesKey,
  inScreeningCompanyMatchesKey,
  receivedInterestsKey,
  sentInvitesKey,
} from "@/hooks/queries/useCompanyMatches";
import {
  inScreeningMatchesKey,
  matchInvitesKey,
  matchesKey,
  sentInterestsKey,
} from "@/hooks/queries/useMatches";
import { opportunitiesKey } from "@/hooks/queries/useOpportunities";
import {
  companyProposalsKey,
  myProposalsKey,
} from "@/hooks/queries/useProposals";
import {
  screeningAttemptKey,
  screeningInvitationKey,
} from "@/hooks/queries/useScreeningInvitations";
import { apiFetch } from "@/lib/api-client";
import type {
  ScreeningAttemptDTO,
  ScreeningInvitationDetailDTO,
  ScreeningStageDecisionRequestDTO,
  ScreeningSubmissionRequestDTO,
} from "@/types/screening";

// A ação que ficou pendente (demonstrar interesse, aceitar convite -- proposta nunca é
// automatizada) pode se completar sozinha na última etapa aprovada, ou o match pode ser
// recusado numa reprovação -- por isso invalida tanto as listas de match quanto as de proposta,
// dos dois lados, independente de qual das três originou o convite.
function useInvalidateAfterScreeningAction(invitationId: number) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: screeningAttemptKey(invitationId),
    });
    queryClient.invalidateQueries({
      queryKey: screeningInvitationKey(invitationId),
    });
    // Prefixo largo (sem id) -- pega o /process de QUALQUER etapa deste processo, não só
    // invitationId, já que aprovar/reprovar uma etapa muda o fluxo inteiro visto a partir de
    // qualquer uma das outras.
    queryClient.invalidateQueries({ queryKey: ["screening-invitations"] });
    queryClient.invalidateQueries({ queryKey: matchesKey() });
    queryClient.invalidateQueries({ queryKey: matchInvitesKey() });
    queryClient.invalidateQueries({ queryKey: sentInterestsKey() });
    queryClient.invalidateQueries({ queryKey: inScreeningMatchesKey() });
    queryClient.invalidateQueries({ queryKey: opportunitiesKey() });
    queryClient.invalidateQueries({ queryKey: myProposalsKey() });
    queryClient.invalidateQueries({ queryKey: receivedInterestsKey() });
    queryClient.invalidateQueries({ queryKey: sentInvitesKey() });
    queryClient.invalidateQueries({ queryKey: confirmedCompanyMatchesKey() });
    queryClient.invalidateQueries({ queryKey: inScreeningCompanyMatchesKey() });
    queryClient.invalidateQueries({ queryKey: companyProposalsKey() });
  };
}

/** Chamado ao abrir a tela de resposta -- idempotente se já estiver IN_PROGRESS. */
export function useStartScreeningAttempt(invitationId: number) {
  return useMutation({
    mutationFn: () =>
      apiFetch<ScreeningAttemptDTO>(
        `/api/screening-invitations/${invitationId}/start`,
        {
          method: "POST",
        }
      ),
  });
}

export function useDeclineScreeningInvitation(invitationId: number) {
  const invalidate = useInvalidateAfterScreeningAction(invitationId);
  return useMutation({
    mutationFn: () =>
      apiFetch<{ message: string }>(
        `/api/screening-invitations/${invitationId}/decline`,
        { method: "POST" }
      ),
    onSuccess: invalidate,
  });
}

/** Submissão única e definitiva de uma etapa -- sem edição depois. Fica aguardando a decisão
 * manual da empresa (aprovar/reprovar), nunca se resolve sozinha. */
export function useSubmitScreeningAnswers(invitationId: number) {
  const invalidate = useInvalidateAfterScreeningAction(invitationId);
  return useMutation({
    mutationFn: (body: ScreeningSubmissionRequestDTO) =>
      apiFetch<ScreeningInvitationDetailDTO>(
        `/api/screening-invitations/${invitationId}/submit`,
        { method: "POST", body }
      ),
    onSuccess: invalidate,
  });
}

/** Aprova o avanço -- se havia próxima etapa, ela já foi criada (o profissional é notificado); se
 * era a última, o backend já retomou a ação pendente sozinho (interesse/aceite) ou, no caso de
 * proposta, não mexeu em nada (aceite/recusa dela continua sendo decisão independente). */
export function useApproveScreeningInvitation(invitationId: number) {
  const invalidate = useInvalidateAfterScreeningAction(invitationId);
  return useMutation({
    mutationFn: (body: ScreeningStageDecisionRequestDTO) =>
      apiFetch<ScreeningInvitationDetailDTO>(
        `/api/screening-invitations/${invitationId}/approve`,
        { method: "POST", body }
      ),
    onSuccess: invalidate,
  });
}

/** Reprova nesta etapa -- pra interesse/aceite, o backend já recusa o match formalmente
 * (cascade-cancel de qualquer outra etapa pendente incluso); pra proposta, não toca nela. */
export function useReproveScreeningInvitation(invitationId: number) {
  const invalidate = useInvalidateAfterScreeningAction(invitationId);
  return useMutation({
    mutationFn: (body: ScreeningStageDecisionRequestDTO) =>
      apiFetch<ScreeningInvitationDetailDTO>(
        `/api/screening-invitations/${invitationId}/reprove`,
        { method: "POST", body }
      ),
    onSuccess: invalidate,
  });
}
