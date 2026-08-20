import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationsKey } from "@/hooks/queries/useNotifications";
import { apiFetch } from "@/lib/api-client";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) =>
      apiFetch<{ message: string }>(
        `/api/notifications/${notificationId}/read`,
        { method: "PUT" }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ message: string }>("/api/notifications/read-all", {
        method: "PUT",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey() });
    },
  });
}
