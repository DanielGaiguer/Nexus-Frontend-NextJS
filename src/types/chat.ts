/**
 * Espelha com.main.nexus.dto.ChatSummaryDTO — um item da lista de conversas
 * (matches confirmados, ver GET /api/chat/matches).
 */
export interface ChatSummaryDTO {
  matchId: number;
  otherPartyName: string;
  otherPartyPhotoUrl: string | null;
  otherPartyType: "PROFESSIONAL" | "COMPANY";
  projectTitle: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  matchActive: boolean | null;
  daysUntilExpiration: number | null;
}

/** Espelha com.main.nexus.dto.MessageDTO. */
export interface MessageDTO {
  id: number;
  matchId: number;
  senderId: number;
  senderName: string;
  senderType: "PROFESSIONAL" | "COMPANY";
  senderPhotoUrl: string | null;
  content: string;
  sentAt: string;
  read: boolean;
}

/** Espelha com.main.nexus.dto.SendMessageRequestDTO — payload do STOMP SEND. */
export interface SendMessageRequestDTO {
  content: string;
}

/**
 * Resposta de GET /api/chat/ws-token (Route Handler próprio, não espelha
 * nada do backend Java) — token cru + URL base do WebSocket, only pra
 * abrir a conexão STOMP a partir do client. Ver README ("Prompt 4 — chat")
 * pra explicação completa de por que isso é necessário.
 */
export interface WsTokenDTO {
  token: string;
  wsBaseUrl: string;
}

/** Payload publicado em /user/queue/chat-notification pelo ChatWebSocketHandler. */
export interface ChatNotificationPayload {
  matchId: number;
  unreadCount: number;
}
