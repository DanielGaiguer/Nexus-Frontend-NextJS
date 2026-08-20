import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ChatSummaryDTO, MessageDTO } from "@/types/chat";

export const chatMatchesKey = () => ["chat", "matches"] as const;
export const chatMessagesKey = (matchId: number) =>
  ["chat", matchId, "messages"] as const;
export const chatUnreadTotalKey = () => ["chat", "unread-total"] as const;

/** Lista de conversas (matches confirmados) — mesmo polling de 30s do app antigo. */
export function useChatMatches() {
  return useQuery({
    queryKey: chatMatchesKey(),
    queryFn: () => apiFetch<ChatSummaryDTO[]>("/api/chat/matches"),
    refetchInterval: 30 * 1000,
  });
}

/** Histórico de um chat — o GET já marca como lidas as mensagens não lidas (se o match estiver ativo). */
export function useChatMessages(matchId: number) {
  return useQuery({
    queryKey: chatMessagesKey(matchId),
    queryFn: () => apiFetch<MessageDTO[]>(`/api/chat/${matchId}/messages`),
  });
}

/**
 * Total de não lidas pro badge "Conversas" da sidebar. O conector global
 * (useChatNotifications) atualiza esse mesmo cache via WebSocket em tempo
 * real — o polling aqui é só o fallback caso a conexão STOMP não pegue.
 */
export function useChatUnreadTotal() {
  return useQuery({
    queryKey: chatUnreadTotalKey(),
    queryFn: () => apiFetch<number>("/api/chat/unread-total"),
    refetchInterval: 60 * 1000,
  });
}
