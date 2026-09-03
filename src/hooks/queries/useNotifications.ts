import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { NotificationSummaryDTO } from "@/types/notification";

export const notificationsKey = () => ["notifications"] as const;

/** Resumo (contagem + lista) do sino de notificações — polling, igual ao app antigo. */
export function useNotifications() {
  return useQuery({
    queryKey: notificationsKey(),
    queryFn: () => apiFetch<NotificationSummaryDTO>("/api/notifications"),
    // Feed de eventos, não tempo real: marcar como lida/lida-todas já invalida
    // esta chave. 5min de polling cobre o resto sem 1 request/min por aba.
    refetchInterval: 5 * 60 * 1000,
  });
}
