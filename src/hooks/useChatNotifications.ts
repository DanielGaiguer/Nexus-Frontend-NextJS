"use client";

import { Client } from "@stomp/stompjs";
import { useEffect } from "react";
import SockJS from "sockjs-client";

import { useQueryClient } from "@tanstack/react-query";

import { chatUnreadTotalKey } from "@/hooks/queries/useChat";
import { apiFetch } from "@/lib/api-client";
import type { ChatNotificationPayload, WsTokenDTO } from "@/types/chat";

/**
 * Conector global — igual ao `nexus-chat-notify.js` original, montado uma
 * vez no shell autenticado (não depende de estar na tela de chat). Só
 * escuta `/user/queue/chat-notification` pra manter o badge "Conversas" da
 * sidebar atualizado em tempo real, sem precisar recarregar a página nem
 * dar match manual com uma conversa aberta.
 */
export function useChatNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    let client: Client | null = null;

    apiFetch<WsTokenDTO>("/api/chat/ws-token")
      .then(({ token, wsBaseUrl }) => {
        if (cancelled) return;

        client = new Client({
          webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`),
          connectHeaders: { Authorization: `Bearer ${token}` },
          reconnectDelay: 5000,
          onConnect: () => {
            client?.subscribe("/user/queue/chat-notification", (frame) => {
              const payload = JSON.parse(frame.body) as ChatNotificationPayload;
              if (typeof payload.unreadCount === "number") {
                queryClient.setQueryData(
                  chatUnreadTotalKey(),
                  payload.unreadCount
                );
              }
            });
          },
        });
        client.activate();
      })
      .catch(() => {
        // Silencioso — sem badge em tempo real, o polling de useChatUnreadTotal cobre.
      });

    return () => {
      cancelled = true;
      client?.deactivate();
    };
  }, [queryClient]);
}
