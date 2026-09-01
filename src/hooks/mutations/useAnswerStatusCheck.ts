import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pendingStatusCheckKey } from "@/hooks/queries/useReviews";
import { apiFetch } from "@/lib/api-client";
import type { MatchConfirmationDTO } from "@/types/match";
import type { MatchOutcome } from "@/types/review";

/**
 * Resposta de um lado (contratante OU profissional) na janela de confirmação
 * pós-contratação. `finalAmount` só é enviado quando houve trabalho.
 */
export function useAnswerStatusCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      matchId,
      outcome,
      finalAmount,
    }: {
      matchId: number;
      outcome: MatchOutcome;
      finalAmount: number | null;
    }) =>
      apiFetch<MatchConfirmationDTO>(`/api/matches/${matchId}/status-check`, {
        method: "POST",
        body: { outcome, finalAmount },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingStatusCheckKey() });
      // Os cards de match carregam o bloco `confirmation` — atualiza as listas
      // (prefixos cobrem todas as abas: confirmados, anteriores, detalhe, etc.).
      queryClient.invalidateQueries({ queryKey: ["professional", "matches"] });
      queryClient.invalidateQueries({ queryKey: ["company", "matches"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({
        queryKey: ["professional", "previous-projects"],
      });
    },
  });
}
