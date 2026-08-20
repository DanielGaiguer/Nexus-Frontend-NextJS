import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  matchesKey,
  matchInvitesKey,
  previousMatchesKey,
  sentInterestsKey,
} from "@/hooks/queries/useMatches";
import { opportunitiesKey } from "@/hooks/queries/useOpportunities";
import { apiFetch } from "@/lib/api-client";
import type { ProfessionalRejectRequestDTO } from "@/types/match";

/**
 * As três ações que o profissional pode tomar sobre um match
 * (MatchController: professional-accept/-reject/-cancel). Todas invalidam o
 * mesmo conjunto de listas — o backend pode mover o match entre "invites",
 * "sent", a lista geral e "opportunities" dependendo da transição de status.
 */
function useInvalidateMatchLists() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: matchesKey() });
    queryClient.invalidateQueries({ queryKey: matchInvitesKey() });
    queryClient.invalidateQueries({ queryKey: sentInterestsKey() });
    queryClient.invalidateQueries({ queryKey: previousMatchesKey() });
    queryClient.invalidateQueries({ queryKey: opportunitiesKey() });
  };
}

export function useAcceptMatch() {
  const invalidate = useInvalidateMatchLists();
  return useMutation({
    mutationFn: (matchId: number) =>
      apiFetch<{ message: string }>(
        `/api/matches/${matchId}/professional-accept`,
        {
          method: "POST",
        }
      ),
    onSuccess: invalidate,
  });
}

export function useRejectMatch() {
  const invalidate = useInvalidateMatchLists();
  return useMutation({
    mutationFn: ({
      matchId,
      ...body
    }: ProfessionalRejectRequestDTO & { matchId: number }) =>
      apiFetch<{ message: string }>(
        `/api/matches/${matchId}/professional-reject`,
        {
          method: "POST",
          body,
        }
      ),
    onSuccess: invalidate,
  });
}

export function useCancelMatch() {
  const invalidate = useInvalidateMatchLists();
  return useMutation({
    mutationFn: (matchId: number) =>
      apiFetch<{ message: string }>(
        `/api/matches/${matchId}/professional-cancel`,
        {
          method: "POST",
        }
      ),
    onSuccess: invalidate,
  });
}
