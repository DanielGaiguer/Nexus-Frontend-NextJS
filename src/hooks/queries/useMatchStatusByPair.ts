import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { StatusMatch } from "@/types/match";

export const matchStatusByPairKey = (
  professionalId: number | undefined,
  projectId: number | undefined
) => ["matches", "status-by-pair", professionalId, projectId] as const;

/**
 * Status do match (se existir) entre um profissional e um projeto -- usado
 * por ProfessionalCompareDialog pra decidir se mostra "Demonstrar interesse":
 * só faz sentido quando ainda não há nenhum envolvimento (status null ou
 * WAITING, o match gerado automaticamente pelo ranking sem ação de nenhum
 * lado), não quando já está em andamento ou recusado.
 */
export function useMatchStatusByPair(
  professionalId: number | undefined,
  projectId: number | undefined
) {
  return useQuery({
    queryKey: matchStatusByPairKey(professionalId, projectId),
    queryFn: () =>
      apiFetch<{ status: StatusMatch | null }>(
        `/api/matches/status-by-pair?professionalId=${professionalId}&projectId=${projectId}`
      ),
    enabled: professionalId != null && projectId != null,
  });
}
