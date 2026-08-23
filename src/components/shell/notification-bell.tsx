"use client";

import {
  Bell,
  BellOff,
  Briefcase,
  Building2,
  CheckCheck,
  Handshake,
  Mail,
  MessageCircleQuestion,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  UserX,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/mutations/useNotificationActions";
import { useNotifications } from "@/hooks/queries/useNotifications";
import type { NotificationDTO, NotificationType } from "@/types/notification";

const typeIcon: Partial<Record<NotificationType, LucideIcon>> = {
  NEW_INVITE: Mail,
  NEW_INTEREST_RECEIVED: Send,
  MATCH_CONFIRMED: Handshake,
  MATCH_CANCELLED: X,
  INVITE_REJECTED: X,
  HIGH_SCORE_OPPORTUNITY: Sparkles,
  HIGH_SCORE_CANDIDATE: Sparkles,
  COMPANY_APPROVED: ShieldCheck,
  COMPANY_REJECTED: ShieldX,
  PROJECT_CLOSED: Briefcase,
  PROJECT_CLOSED_BY_ADMIN: ShieldX,
  COMPLETE_YOUR_PROFILE: UserX,
  NEW_COMPANY_REGISTRATION: Building2,
  MATCH_STATUS_CHECK: MessageCircleQuestion,
  MATCH_EXPIRED_REVIEW_REQUEST: MessageCircleQuestion,
  PROJECT_POSITIONS_FULL: ShieldAlert,
  PROJECT_ADDED_TO_PORTFOLIO: Briefcase,
  ACCOUNT_MARKED_UNAVAILABLE: ShieldAlert,
};

function formatTimeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "agora mesmo";
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  const days = Math.floor(diff / 86400);
  return days === 1 ? "ontem" : `${days} dias atrás`;
}

function NotificationItem({
  notification,
  onOpen,
}: {
  notification: NotificationDTO;
  onOpen: (notification: NotificationDTO) => void;
}) {
  const Icon = typeIcon[notification.type] ?? Bell;
  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`hover:bg-accent flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 ${
        notification.read ? "" : "bg-primary/5"
      }`}
    >
      <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{notification.title}</div>
        <div className="text-muted-foreground text-xs">
          {notification.message}
        </div>
        <div className="text-muted-foreground mt-1 text-[11px]">
          {formatTimeAgo(notification.createdAt)}
        </div>
      </div>
      {!notification.read && (
        <span className="bg-primary mt-1 size-2 shrink-0 rounded-full" />
      )}
    </button>
  );
}

/**
 * Sino de notificações do topbar — igual ao `#notifBtnWrapper` do app
 * antigo (`GET /api/notifications`, polling de 60s, clique marca como lida
 * e navega pro `actionUrl`). Distinto do badge "Conversas" da sidebar
 * (useChatNotifications/useChatUnreadTotal), que só cobre chat — este cobre
 * o feed geral de eventos (convite, match, aprovação de empresa, etc.).
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  function handleOpen(notification: NotificationDTO) {
    if (!notification.read) markRead.mutate(notification.id);
    setOpen(false);
    if (notification.actionUrl) router.push(notification.actionUrl);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações"
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] text-white tabular-nums">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-sm font-semibold">Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="size-3.5" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 px-4 py-8 text-center">
            <BellOff className="size-6" />
            <span className="text-sm">Nenhuma notificação</span>
          </div>
        ) : (
          <ScrollArea className="h-96">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={handleOpen}
              />
            ))}
          </ScrollArea>
        )}
        <div className="text-muted-foreground border-t px-4 py-2 text-center text-[11px]">
          Notificações antigas são removidas automaticamente
        </div>
      </PopoverContent>
    </Popover>
  );
}
