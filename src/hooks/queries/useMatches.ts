import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { MatchResponseDTO } from "@/types/match";

/**
 * Um hook por endpoint de matches do profissional (ver
 * ProfessionalController: /matches, /matches/invites, /matches/sent,
 * /matches/previous) — confirmados e recusados não têm endpoint dedicado,
 * são filtrados a partir de useMatches() (all) por `status` na tela.
 */

export const matchesKey = () => ["professional", "matches"] as const;
export const matchInvitesKey = () =>
  ["professional", "matches", "invites"] as const;
export const sentInterestsKey = () =>
  ["professional", "matches", "sent"] as const;
export const previousMatchesKey = () =>
  ["professional", "matches", "previous"] as const;
export const inScreeningMatchesKey = () =>
  ["professional", "matches", "in-screening"] as const;

export function useMatches() {
  return useQuery({
    queryKey: matchesKey(),
    queryFn: () => apiFetch<MatchResponseDTO[]>("/api/professional/matches"),
  });
}

export function useMatchInvites() {
  return useQuery({
    queryKey: matchInvitesKey(),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>("/api/professional/matches/invites"),
  });
}

export function useSentInterests() {
  return useQuery({
    queryKey: sentInterestsKey(),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>("/api/professional/matches/sent"),
  });
}

export function usePreviousMatches() {
  return useQuery({
    queryKey: previousMatchesKey(),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>("/api/professional/matches/previous"),
  });
}

export function useInScreeningMatches() {
  return useQuery({
    queryKey: inScreeningMatchesKey(),
    queryFn: () =>
      apiFetch<MatchResponseDTO[]>("/api/professional/matches/in-screening"),
  });
}
