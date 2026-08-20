import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { NotificationSummaryDTO } from "@/types/notification";

export const notificationsKey = () => ["notifications"] as const;

/** Resumo (contagem + lista) do sino de notificações — polling, igual ao app antigo. */
export function useNotifications() {
  return useQuery({
    queryKey: notificationsKey(),
    queryFn: () => apiFetch<NotificationSummaryDTO>("/api/notifications"),
    refetchInterval: 60 * 1000,
  });
}
