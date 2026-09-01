"use client";

import { LifeBuoy } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupportConversations } from "@/hooks/queries/useSupport";
import { cn } from "@/lib/utils";
import type { SupportConversationStatus } from "@/types/support";

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return sameDay
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function SupportConversationList({
  side,
  status = "ALL",
}: {
  side: "admin" | "user";
  status?: SupportConversationStatus | "ALL";
}) {
  const { data: conversations, isLoading } = useSupportConversations(
    side,
    status
  );
  const hrefBase = side === "admin" ? "/admin/support" : "/support";

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <EmptyState
        icon={LifeBuoy}
        title="Nenhuma conversa de suporte"
        description={
          side === "admin"
            ? "Abra uma conversa com um profissional ou contratante."
            : "Abra um chamado no botão acima ou aguarde o suporte do Nexus entrar em contato."
        }
      />
    );
  }

  return (
    <div className="flex flex-col divide-y rounded-lg border">
      {conversations.map((c) => {
        const isClosed = c.status === "CLOSED";
        const heading = side === "admin" ? c.userName : "Suporte Nexus";
        return (
          <Link
            key={c.id}
            href={`${hrefBase}/${c.id}`}
            className={cn(
              "hover:bg-accent/50 flex items-center gap-3 p-3 transition-colors",
              isClosed && "opacity-60"
            )}
          >
            <Avatar className="size-11 shrink-0">
              <AvatarImage
                src={
                  side === "admin" ? (c.userPhotoUrl ?? undefined) : undefined
                }
                alt=""
              />
              <AvatarFallback>
                {side === "admin" ? (
                  heading.charAt(0).toUpperCase()
                ) : (
                  <LifeBuoy className="size-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-semibold">{heading}</span>
                  {c.subject && (
                    <span className="text-muted-foreground ml-1.5 text-xs">
                      {c.subject}
                    </span>
                  )}
                  {side === "admin" && c.openedByUser && (
                    <Badge
                      variant="outline"
                      className="ml-1.5 align-middle text-[10px]"
                    >
                      Aberto pelo usuário
                    </Badge>
                  )}
                </div>
                {isClosed ? (
                  <Badge variant="outline" className="shrink-0 text-[11px]">
                    Encerrada
                  </Badge>
                ) : (
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatTime(c.lastMessageAt ?? c.createdAt)}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className="text-muted-foreground truncate text-sm">
                  {c.lastMessage ?? "Nenhuma mensagem ainda"}
                </span>
                {c.unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-[11px]"
                  >
                    {c.unreadCount > 99 ? "99+" : c.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
