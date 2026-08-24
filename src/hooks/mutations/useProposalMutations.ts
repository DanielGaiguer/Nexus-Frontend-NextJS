import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  confirmedCompanyMatchesKey,
  receivedInterestsKey,
  sentInvitesKey,
} from "@/hooks/queries/useCompanyMatches";
import { matchesKey } from "@/hooks/queries/useMatches";
import { myProjectsKey } from "@/hooks/queries/useMyProjects";
import { opportunitiesKey } from "@/hooks/queries/useOpportunities";
import {
  myProposalsKey,
  projectProposalsKey,
  proposalKey,
} from "@/hooks/queries/useProposals";
import { apiFetch } from "@/lib/api-client";
import type { ProposalRequestDTO, ProposalResponseDTO } from "@/types/proposal";

/** Envio de uma nova proposta (pro/opportunities/[projectId]/proposal). */
export function useSubmitProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProposalRequestDTO) =>
      apiFetch<ProposalResponseDTO>("/api/proposals", {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myProposalsKey() });
      queryClient.invalidateQueries({ queryKey: opportunitiesKey() });
    },
  });
}

/** Edição de uma proposta ainda PENDING. */
export function useUpdateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      proposalId,
      ...body
    }: ProposalRequestDTO & { proposalId: number }) =>
      apiFetch<ProposalResponseDTO>(`/api/proposals/${proposalId}`, {
        method: "PUT",
        body,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: myProposalsKey() });
      queryClient.invalidateQueries({
        queryKey: proposalKey(variables.proposalId),
      });
    },
  });
}

export function useWithdrawProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proposalId: number) =>
      apiFetch<{ message: string }>(`/api/proposals/${proposalId}/withdraw`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myProposalsKey() });
      queryClient.invalidateQueries({ queryKey: opportunitiesKey() });
    },
  });
}

function useInvalidateAfterProposalDecision() {
  const queryClient = useQueryClient();
  return (projectId: number) => {
    queryClient.invalidateQueries({ queryKey: projectProposalsKey(projectId) });
    queryClient.invalidateQueries({ queryKey: confirmedCompanyMatchesKey() });
    queryClient.invalidateQueries({ queryKey: receivedInterestsKey() });
    queryClient.invalidateQueries({ queryKey: sentInvitesKey() });
    queryClient.invalidateQueries({ queryKey: myProjectsKey() });
    queryClient.invalidateQueries({ queryKey: matchesKey() });
  };
}

/** Empresa aceita uma proposta — confirma o Match (MATCHED) vinculado a ela. */
export function useAcceptProposal() {
  const invalidate = useInvalidateAfterProposalDecision();
  return useMutation({
    mutationFn: ({ proposalId }: { proposalId: number; projectId: number }) =>
      apiFetch<{ message: string }>(`/api/proposals/${proposalId}/accept`, {
        method: "POST",
      }),
    onSuccess: (_data, variables) => invalidate(variables.projectId),
  });
}

export function useRejectProposal() {
  const invalidate = useInvalidateAfterProposalDecision();
  return useMutation({
    mutationFn: ({ proposalId }: { proposalId: number; projectId: number }) =>
      apiFetch<{ message: string }>(`/api/proposals/${proposalId}/reject`, {
        method: "POST",
      }),
    onSuccess: (_data, variables) => invalidate(variables.projectId),
  });
}

/** Anexos de portfólio — upload de um ou mais arquivos pra uma proposta PENDING. */
export function useUploadProposalAttachments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      proposalId,
      files,
    }: {
      proposalId: number;
      files: File[];
    }) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      return apiFetch<ProposalResponseDTO>(
        `/api/proposals/${proposalId}/attachments`,
        { method: "POST", body: formData }
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: myProposalsKey() });
      queryClient.invalidateQueries({
        queryKey: proposalKey(variables.proposalId),
      });
    },
  });
}

export function useDeleteProposalAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      proposalId,
      attachmentId,
    }: {
      proposalId: number;
      attachmentId: number;
    }) =>
      apiFetch<{ message: string }>(
        `/api/proposals/${proposalId}/attachments/${attachmentId}`,
        { method: "DELETE" }
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: myProposalsKey() });
      queryClient.invalidateQueries({
        queryKey: proposalKey(variables.proposalId),
      });
    },
  });
}
