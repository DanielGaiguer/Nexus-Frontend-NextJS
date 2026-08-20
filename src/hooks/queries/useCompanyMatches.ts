import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";

/** Um hook por endpoint de matches da empresa (ver ProjectController). */

export const receivedInterestsKey = () =>
  ["company", "matches", "received"] as const;
export const sentInvitesKey = () => ["company", "matches", "sent"] as const;
export const confirmedCompanyMatchesKey = () =>
  ["company", "matches", "confirmed"] as const;
export const rejectedCompanyMatchesKey = () =>
  ["company", "matches", "rejected"] as const;
export const previousCompanyMatchesKey = () =>
  ["company", "matches", "previous"] as const;

export function useReceivedInterests() {
  return useQuery({
    queryKey: receivedInterestsKey(),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>("/api/projects/matches/received"),
  });
}

export function useSentInvites() {
  return useQuery({
    queryKey: sentInvitesKey(),
    queryFn: () => apiFetch<MatchResponseDTO[]>("/api/projects/matches/sent"),
  });
}

export function useConfirmedCompanyMatches() {
  return useQuery({
    queryKey: confirmedCompanyMatchesKey(),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>("/api/projects/matches/confirmed"),
  });
}

export function useRejectedCompanyMatches() {
  return useQuery({
    queryKey: rejectedCompanyMatchesKey(),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>("/api/projects/matches/rejected"),
  });
}

export function usePreviousCompanyMatches() {
  return useQuery({
    queryKey: previousCompanyMatchesKey(),
    queryFn: () => apiFetch<MatchResponseDTO[]>("/api/projects/previous"),
  });
}
