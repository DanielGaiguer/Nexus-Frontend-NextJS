"use client";

import { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

import { useQueryClient } from "@tanstack/react-query";

import { chatMessagesKey } from "@/hooks/queries/useChat";
import { apiFetch } from "@/lib/api-client";
import type { MessageDTO, WsTokenDTO } from "@/types/chat";

/**
 * Conexão STOMP dedicada a um chat aberto — assina `/topic/chat/{matchId}`
 * (broadcast: tanto quem manda quanto quem recebe estão inscritos, então o
 * eco da própria mensagem enviada chega por aqui, sem precisar de append
 * otimista local) e `/user/queue/errors` (erros pontuais do envio).
 *
 * Só conecta se `active` (match ainda não expirado) — igual ao
 * `nexus-chat.js` original, que nem chama `connectSocket()` pra matches
 * encerrados (histórico fica só leitura via REST).
 */
export function useChatSocket(matchId: number, active: boolean) {
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

            client.subscribe(`/topic/chat/${matchId}`, (frame) => {
              const message = JSON.parse(frame.body) as MessageDTO;
              queryClient.setQueryData<MessageDTO[]>(
                chatMessagesKey(matchId),
                (old) => {
                  if (!old) return [message];
                  if (old.some((m) => m.id === message.id)) return old;
                  return [...old, message];
                }
              );
            });

            client.subscribe("/user/queue/errors", (frame) => {
              const payload = JSON.parse(frame.body) as { error?: string };
              setError(payload.error ?? "Erro desconhecido no chat.");
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
          setError("Não foi possível autenticar a conexão de chat.");
      });

    return () => {
      cancelled = true;
      clientRef.current?.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [matchId, active, queryClient]);

  const sendMessage = useCallback(
    (content: string) => {
      clientRef.current?.publish({
        destination: `/app/chat/${matchId}/send`,
        body: JSON.stringify({ content }),
      });
    },
    [matchId]
  );

  return { isConnected, error, sendMessage };
}
