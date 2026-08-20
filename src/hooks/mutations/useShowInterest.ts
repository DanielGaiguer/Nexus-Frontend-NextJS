import { useMutation, useQueryClient } from "@tanstack/react-query";

import { opportunitiesKey } from "@/hooks/queries/useOpportunities";
import { sentInterestsKey } from "@/hooks/queries/useMatches";
import { apiFetch } from "@/lib/api-client";

/** Profissional demonstra interesse numa vaga/projeto (pro-opportunities.html). */
export function useShowInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: number) =>
      apiFetch<{ message: string }>(
        `/api/professional/opportunities/${projectId}/interest`,
        { method: "POST" }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunitiesKey() });
      queryClient.invalidateQueries({ queryKey: sentInterestsKey() });
    },
  });
}
