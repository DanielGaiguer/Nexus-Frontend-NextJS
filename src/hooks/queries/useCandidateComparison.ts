import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  CandidateComparisonRequestDTO,
  CandidateComparisonResponseDTO,
} from "@/types/comparison";

/**
 * Comparação de candidatos é conceitualmente uma leitura (não muda nada no
 * servidor) que só usa POST porque o filtro (`matchIds`) não cabe numa
 * query string curta. Por isso `useQuery`, não `useMutation`: disparar a
 * requisição de dentro de um `useEffect` com `useMutation` deixa o
 * resultado órfão no Strict Mode do dev — o efeito roda, dispara o
 * `mutate()`, e o double-invoke (mount → cleanup → mount) desinscreve esse
 * observer antes da resposta chegar; a segunda passada do efeito não
 * dispara de novo (o guard existe pra evitar POST duplicado), então a
 * resposta nunca alcança o componente e a tela fica presa no skeleton.
 * `useQuery` já foi feito pra esse ciclo de vida — sem efeito manual, sem
 * guard, sem observer órfão.
 */
export const candidateComparisonKey = (
  request: CandidateComparisonRequestDTO | undefined
) =>
  [
    "company",
    "comparison",
    request?.projectId,
    request?.matchIds.join(","),
  ] as const;

export function useCandidateComparison(
  request: CandidateComparisonRequestDTO | undefined
) {
  return useQuery({
    queryKey: candidateComparisonKey(request),
    queryFn: () =>
      apiFetch<CandidateComparisonResponseDTO>("/api/comparison/candidates", {
        method: "POST",
        body: request,
      }),
    enabled: request != null && request.matchIds.length > 0,
  });
}

export const myMatchComparisonKey = (matchId: number | undefined) =>
  ["professional", "comparison", matchId] as const;

/**
 * Mesma resposta de `useCandidateComparison` (um único candidato — o
 * próprio profissional logado), mas do lado do profissional: ele só pode
 * comparar consigo mesmo, com um match que já é dele (ver
 * `/api/comparison/candidates/mine` no backend).
 */
export function useMyMatchComparison(matchId: number | undefined) {
  return useQuery({
    queryKey: myMatchComparisonKey(matchId),
    queryFn: () =>
      apiFetch<CandidateComparisonResponseDTO>(
        `/api/comparison/candidates/mine?matchId=${matchId}`,
        { method: "POST" }
      ),
    enabled: matchId != null,
  });
}
