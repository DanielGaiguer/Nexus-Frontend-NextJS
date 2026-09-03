import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  SupportConversationDTO,
  SupportConversationStatus,
  SupportMessageDTO,
} from "@/types/support";

type Side = "admin" | "user";

export const supportConversationsKey = (
  side: Side,
  status: SupportConversationStatus | "ALL" = "ALL"
) => ["support", side, "conversations", status] as const;
export const supportConversationKey = (side: Side, id: number) =>
  ["support", side, "conversation", id] as const;
export const supportMessagesKey = (side: Side, id: number) =>
  ["support", side, "messages", id] as const;
export const supportUnreadTotalKey = (side: Side) =>
  ["support", side, "unread-total"] as const;

function base(side: Side) {
  return side === "admin" ? "/api/admin/support" : "/api/support";
}

/** Lista de conversas de suporte. `status` só é usado no lado admin. */
export function useSupportConversations(
  side: Side,
  status: SupportConversationStatus | "ALL" = "ALL"
) {
  return useQuery({
    queryKey: supportConversationsKey(side, status),
    queryFn: () => {
      const qs =
        side === "admin" && status !== "ALL" ? `?status=${status}` : "";
      return apiFetch<SupportConversationDTO[]>(
        `${base(side)}/conversations${qs}`
      );
    },
    refetchInterval: 30 * 1000,
  });
}

export function useSupportConversation(side: Side, id: number) {
  return useQuery({
    queryKey: supportConversationKey(side, id),
    queryFn: () =>
      apiFetch<SupportConversationDTO>(`${base(side)}/conversations/${id}`),
  });
}

/** Histórico — o GET marca as mensagens do outro lado como lidas. */
export function useSupportMessages(side: Side, id: number) {
  return useQuery({
    queryKey: supportMessagesKey(side, id),
    queryFn: () =>
      apiFetch<SupportMessageDTO[]>(
        `${base(side)}/conversations/${id}/messages`
      ),
  });
}

/** Badge de não-lidas na sidebar (polling; sem socket global, ao contrário do chat de match). */
export function useSupportUnreadTotal(side: Side) {
  return useQuery({
    queryKey: supportUnreadTotalKey(side),
    queryFn: () => apiFetch<number>(`${base(side)}/unread-total`),
    // Contador de sidebar, não tempo real. Abrir a conversa de suporte
    // (useSupportMessages marca como lida) e as mutations já atualizam; 5min
    // de polling cobre o resto.
    refetchInterval: 5 * 60 * 1000,
  });
}
