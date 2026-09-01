/**
 * Espelha os DTOs de chat de suporte do backend (com.main.nexus.dto.Support*).
 * Datas chegam como String ISO. Transporte STOMP reaproveitado do chat de match
 * (mesmo /ws e ws-token), só os destinos mudam para /app|/topic/support/{id}.
 */

/** Espelha com.main.nexus.model.enums.SupportConversationStatus. */
export type SupportConversationStatus = "OPEN" | "CLOSED";

/** Espelha com.main.nexus.dto.SupportConversationDTO. */
export interface SupportConversationDTO {
  id: number;
  userId: number;
  userName: string;
  userRole: "PROFESSIONAL" | "COMPANY" | string;
  userPhotoUrl: string | null;
  subject: string | null;
  status: SupportConversationStatus;
  openedByAdminEmail: string | null;
  /** true = chamado aberto pelo próprio usuário, não pelo Admin. */
  openedByUser: boolean;
  createdAt: string;
  closedAt: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

/** Espelha com.main.nexus.dto.SupportMessageDTO. */
export interface SupportMessageDTO {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: "ADMIN" | "PROFESSIONAL" | "COMPANY" | string;
  senderPhotoUrl: string | null;
  content: string;
  sentAt: string;
  read: boolean;
}

/** Corpo de POST /api/admin/support/conversations. */
export interface OpenSupportConversationBody {
  userId: number;
  subject: string | null;
  message: string | null;
}

/** Corpo de POST /api/support/conversations — o usuário abre um chamado. */
export interface OpenSupportTicketBody {
  subject: string | null;
  message: string;
}

/** Payload publicado em /user/queue/support-notification. */
export interface SupportNotificationPayload {
  conversationId: number;
  unreadCount: number;
}
