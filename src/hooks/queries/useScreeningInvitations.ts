import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  ScreeningAttemptDTO,
  ScreeningInvitationDetailDTO,
  ScreeningProcessSummaryDTO,
} from "@/types/screening";

/** Um hook por endpoint de resposta/avaliação do questionário (ver ScreeningInvitationController). */

export const screeningInvitationKey = (id: number) =>
  ["screening-invitations", id] as const;
export const screeningAttemptKey = (id: number) =>
  ["screening-invitations", id, "attempt"] as const;
export const screeningProcessDetailKey = (id: number) =>
  ["screening-invitations", id, "process"] as const;
export const myScreeningProcessesKey = () =>
  ["professional", "screening-invitations", "mine"] as const;
export const companyScreeningProcessesKey = () =>
  ["company", "screening-invitations", "mine"] as const;

/** Detalhe pós-submissão -- avaliação (empresa) ou resultado (profissional). */
export function useScreeningInvitation(id: number | undefined) {
  return useQuery({
    queryKey: screeningInvitationKey(id ?? 0),
    queryFn: () =>
      apiFetch<ScreeningInvitationDetailDTO>(
        `/api/screening-invitations/${id}`
      ),
    enabled: id != null,
  });
}

/** Detalhe completo (com respostas) de todas as etapas já alcançadas do processo inteiro --
 * `id` é âncora (pode ser o id de qualquer etapa do processo), a resposta representa o processo
 * todo. Base do fluxo de etapas na tela de detalhe. */
export function useScreeningProcessDetail(id: number | undefined) {
  return useQuery({
    queryKey: screeningProcessDetailKey(id ?? 0),
    queryFn: () =>
      apiFetch<ScreeningInvitationDetailDTO[]>(
        `/api/screening-invitations/${id}/process`
      ),
    enabled: id != null,
  });
}

/** O que o profissional vê ao abrir a tela de resposta, antes de submeter. */
export function useScreeningAttempt(id: number | undefined) {
  return useQuery({
    queryKey: screeningAttemptKey(id ?? 0),
    queryFn: () =>
      apiFetch<ScreeningAttemptDTO>(`/api/screening-invitations/${id}/attempt`),
    enabled: id != null,
  });
}

/** Tela "Processos Seletivos" do profissional -- todos os processos que ele já entrou, com todas
 * as etapas de cada um. */
export function useMyScreeningProcesses() {
  return useQuery({
    queryKey: myScreeningProcessesKey(),
    queryFn: () =>
      apiFetch<ScreeningProcessSummaryDTO[]>("/api/screening-invitations/mine"),
  });
}

/** Tela "Processos Seletivos" da empresa -- todos os processos recebidos, em qualquer vaga sua. */
export function useCompanyScreeningProcesses() {
  return useQuery({
    queryKey: companyScreeningProcessesKey(),
    queryFn: () =>
      apiFetch<ScreeningProcessSummaryDTO[]>(
        "/api/screening-invitations/company/mine"
      ),
  });
}
