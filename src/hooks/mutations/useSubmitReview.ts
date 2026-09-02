import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  pendingReviewKey,
  reviewedMatchIdsKey,
} from "@/hooks/queries/useReviews";
import { sidebarBadgesKey } from "@/hooks/queries/useSidebarBadges";
import { apiFetch } from "@/lib/api-client";
import type { ReviewRequestDTO } from "@/types/review";

export function useSubmitReview(role: "professional" | "company") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      matchId,
      ...body
    }: ReviewRequestDTO & { matchId: number }) =>
      apiFetch<{ message: string }>(`/api/reviews/${matchId}`, {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingReviewKey(role) });
      queryClient.invalidateQueries({ queryKey: reviewedMatchIdsKey(role) });
      // Badge do "Dashboard" (avaliação de match encerrado aguardando resposta).
      queryClient.invalidateQueries({ queryKey: sidebarBadgesKey() });
    },
  });
}
