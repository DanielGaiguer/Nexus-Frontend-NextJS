import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/api-client";
import type {
  PendingReviewDTO,
  PendingStatusCheckDTO,
  ReviewDisplayDTO,
  ReviewPageDTO,
} from "@/types/review";

/** 404 aqui só significa "nada pendente" — não é erro, vira `null`. */
async function fetchOrNull<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const pendingReviewKey = (role: "professional" | "company") =>
  ["reviews", "pending", role] as const;
export const pendingStatusCheckKey = () =>
  ["matches", "status-check", "pending"] as const;
export const reviewedMatchIdsKey = (role: "professional" | "company") =>
  ["reviews", "reviewed-match-ids", role] as const;
export const reviewCountKey = (type: "professional" | "company", id: number) =>
  ["reviews", type, id, "count"] as const;
export const reviewsTop5Key = (type: "professional" | "company", id: number) =>
  ["reviews", type, id, "top5"] as const;
export const reviewsAllKey = (
  type: "professional" | "company",
  id: number,
  rating: number | null
) => ["reviews", type, id, "all", rating] as const;

/** Match expirado sem avaliação ainda deste lado — dispara o modal de "avaliar" no dashboard. */
export function usePendingReview(role: "professional" | "company") {
  return useQuery({
    queryKey: pendingReviewKey(role),
    queryFn: () =>
      fetchOrNull<PendingReviewDTO>(`/api/reviews/pending/${role}`),
  });
}

/** Só empresa responde — match com 14+ dias ainda sem resposta do status check. */
export function usePendingStatusCheck(enabled: boolean) {
  return useQuery({
    queryKey: pendingStatusCheckKey(),
    queryFn: () =>
      fetchOrNull<PendingStatusCheckDTO>("/api/matches/status-check/pending"),
    enabled,
  });
}

/** IDs dos matches já avaliados por este lado — troca "Avaliar" por "Avaliado" nas listas. */
export function useReviewedMatchIds(role: "professional" | "company") {
  return useQuery({
    queryKey: reviewedMatchIdsKey(role),
    queryFn: () =>
      apiFetch<number[]>(`/api/reviews/reviewed-match-ids/${role}`),
  });
}

export function useReviewCount(
  type: "professional" | "company",
  id: number | undefined
) {
  return useQuery({
    queryKey: reviewCountKey(type, id ?? 0),
    queryFn: () => apiFetch<number>(`/api/reviews/${type}/${id}/count`),
    enabled: id != null,
  });
}

/** As 5 melhores avaliações (maior nota, desempate por mais recente) — preview do perfil. */
export function useReviewsTop5(
  type: "professional" | "company",
  id: number | undefined
) {
  return useQuery({
    queryKey: reviewsTop5Key(type, id ?? 0),
    queryFn: () =>
      apiFetch<ReviewDisplayDTO[]>(`/api/reviews/${type}/${id}/top5`),
    enabled: id != null,
  });
}

export function useReviewsAll(
  type: "professional" | "company",
  id: number | undefined,
  rating: number | null
) {
  return useQuery({
    queryKey: reviewsAllKey(type, id ?? 0, rating),
    queryFn: () => {
      const qs = rating != null ? `?rating=${rating}` : "";
      return apiFetch<ReviewPageDTO>(`/api/reviews/${type}/${id}/all${qs}`);
    },
    enabled: id != null,
    // Troca de filtro (rating) muda a queryKey — sem isso, cada filtro nunca
    // visitado antes mostra o esqueleto (altura diferente da lista real) até
    // a resposta chegar, dando aquele "pulo". Mantém a lista anterior na
    // tela nesse meio-tempo, sem esqueleto nem salto de layout.
    placeholderData: keepPreviousData,
  });
}
