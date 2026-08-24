import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProposalResponseDTO } from "@/types/proposal";

/** Um hook por endpoint de propostas (ver ProposalController). */

export const projectProposalsKey = (projectId: number) =>
  ["company", "proposals", "project", projectId] as const;
export const myProposalsKey = () =>
  ["professional", "proposals", "mine"] as const;
export const proposalKey = (proposalId: number) =>
  ["proposals", proposalId] as const;

/** Propostas recebidas por um projeto — visão da empresa, comparação de candidatos. */
export function useProjectProposals(projectId: number) {
  return useQuery({
    queryKey: projectProposalsKey(projectId),
    queryFn: () =>
      apiFetch<ProposalResponseDTO[]>(`/api/proposals/project/${projectId}`),
    enabled: Number.isFinite(projectId),
  });
}

/** Propostas enviadas pelo profissional logado. */
export function useMyProposals() {
  return useQuery({
    queryKey: myProposalsKey(),
    queryFn: () => apiFetch<ProposalResponseDTO[]>("/api/proposals/mine"),
  });
}

/** Detalhe de uma proposta — visível pro participante (empresa dona do projeto ou autor). */
export function useProposal(proposalId: number) {
  return useQuery({
    queryKey: proposalKey(proposalId),
    queryFn: () =>
      apiFetch<ProposalResponseDTO>(`/api/proposals/${proposalId}`),
    enabled: Number.isFinite(proposalId),
  });
}
