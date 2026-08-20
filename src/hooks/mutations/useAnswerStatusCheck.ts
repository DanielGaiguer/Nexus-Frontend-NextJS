import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pendingStatusCheckKey } from "@/hooks/queries/useReviews";
import { apiFetch } from "@/lib/api-client";
import type { MatchOutcome } from "@/types/review";

/** Só empresa responde (ver MatchStatusCheckController#answerStatusCheck no backend). */
export function useAnswerStatusCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      matchId,
      outcome,
    }: {
      matchId: number;
      outcome: MatchOutcome;
    }) =>
      apiFetch<{ message: string }>(`/api/matches/${matchId}/status-check`, {
        method: "POST",
        body: { outcome },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingStatusCheckKey() });
    },
  });
}
