"use client";

import { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

import { useQueryClient } from "@tanstack/react-query";

import {
  supportMessagesKey,
  supportUnreadTotalKey,
} from "@/hooks/queries/useSupport";
import { apiFetch } from "@/lib/api-client";
import type { SupportMessageDTO } from "@/types/support";
import type { WsTokenDTO } from "@/types/chat";

/**
 * Conexão STOMP de uma conversa de suporte aberta. Mesmo transporte do chat de
 * match (`/ws`, `ws-token`), só o destino muda: assina `/topic/support/{id}`,
 * publica em `/app/support/{id}/send`. Só conecta se `active` (conversa OPEN).
 *
 * `side` = "admin" | "user" — decide qual chave de cache invalidar para o badge.
 */
export function useSupportChatSocket(
  conversationId: number,
  active: boolean,
  side: "admin" | "user"
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    apiFetch<WsTokenDTO>("/api/chat/ws-token")
      .then(({ token, wsBaseUrl }) => {
        if (cancelled) return;

        const client = new Client({
          webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`),
          connectHeaders: { Authorization: `Bearer ${token}` },
          reconnectDelay: 5000,
          onConnect: () => {
            setIsConnected(true);
            setError(null);

            client.subscribe(`/topic/support/${conversationId}`, (frame) => {
              const message = JSON.parse(frame.body) as SupportMessageDTO;
              queryClient.setQueryData<SupportMessageDTO[]>(
                supportMessagesKey(side, conversationId),
                (old) => {
                  if (!old) return [message];
                  if (old.some((m) => m.id === message.id)) return old;
                  return [...old, message];
                }
              );
              // Mantém o badge da sidebar aproximadamente em dia sem esperar o polling.
              queryClient.invalidateQueries({
                queryKey: supportUnreadTotalKey(side),
              });
            });

            client.subscribe("/user/queue/errors", (frame) => {
              const payload = JSON.parse(frame.body) as { error?: string };
              setError(
                payload.error ?? "Erro desconhecido no chat de suporte."
              );
            });
          },
          onDisconnect: () => setIsConnected(false),
          onWebSocketClose: () => setIsConnected(false),
        });

        clientRef.current = client;
        client.activate();
      })
      .catch(() => {
        if (!cancelled)
          setError("Não foi possível autenticar a conexão de suporte.");
      });

    return () => {
      cancelled = true;
      clientRef.current?.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [conversationId, active, side, queryClient]);

  const sendMessage = useCallback(
    (content: string) => {
      clientRef.current?.publish({
        destination: `/app/support/${conversationId}/send`,
        body: JSON.stringify({ content }),
      });
    },
    [conversationId]
  );

  return { isConnected, error, sendMessage };
}
