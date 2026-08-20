export type NotificationType =
  | "NEW_INVITE"
  | "MATCH_CONFIRMED"
  | "MATCH_CANCELLED"
  | "INVITE_REJECTED"
  | "HIGH_SCORE_OPPORTUNITY"
  | "HIGH_SCORE_CANDIDATE"
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED"
  | "PROJECT_CLOSED"
  | "PROJECT_CLOSED_BY_ADMIN"
  | "NEW_INTEREST_RECEIVED"
  | "COMPLETE_YOUR_PROFILE"
  | "NEW_COMPANY_REGISTRATION"
  | "MATCH_STATUS_CHECK"
  | "MATCH_EXPIRED_REVIEW_REQUEST"
  | "PROJECT_POSITIONS_FULL"
  | "PROJECT_ADDED_TO_PORTFOLIO"
  | "ACCOUNT_MARKED_UNAVAILABLE";

export interface NotificationDTO {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationSummaryDTO {
  unreadCount: number;
  notifications: NotificationDTO[];
}
