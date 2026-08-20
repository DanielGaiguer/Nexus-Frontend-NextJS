"use client";

import { MessageCircleOff, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatMatches } from "@/hooks/queries/useChat";
import { cn } from "@/lib/utils";

function formatListTime(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "ontem";
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function ChatListPage() {
  const { data: chats, isLoading } = useChatMatches();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!chats) return [];
    const term = search.trim().toLowerCase();
    if (!term) return chats;
    return chats.filter(
      (c) =>
        c.otherPartyName.toLowerCase().includes(term) ||
        c.projectTitle.toLowerCase().includes(term)
    );
  }, [chats, search]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversas</h1>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar por nome ou projeto..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-18" />
          ))}
        </div>
      )}

      {!isLoading && (!chats || chats.length === 0) && (
        <EmptyState
          icon={MessageCircleOff}
          title="Nenhuma conversa ainda"
          description="Quando um match for confirmado, o chat será liberado aqui."
        />
      )}

      {!isLoading && chats && chats.length > 0 && filtered.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Nenhuma conversa encontrada.
        </p>
      )}

      <div className="flex flex-col divide-y rounded-lg border">
        {filtered.map((chat) => {
          const isEnded =
            chat.matchActive === false || chat.daysUntilExpiration === -1;
          const isExpiringSoon =
            !isEnded &&
            chat.daysUntilExpiration != null &&
            chat.daysUntilExpiration <= 7;

          return (
            <Link
              key={chat.matchId}
              href={`/chat/${chat.matchId}`}
              className={cn(
                "hover:bg-accent/50 flex items-center gap-3 p-3 transition-colors",
                isEnded && "opacity-60"
              )}
            >
              <Avatar className="size-11 shrink-0">
                <AvatarImage
                  src={chat.otherPartyPhotoUrl ?? undefined}
                  alt=""
                />
                <AvatarFallback>
                  {chat.otherPartyName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-semibold">{chat.otherPartyName}</span>
                    <span className="text-muted-foreground ml-1.5 text-xs">
                      {chat.projectTitle}
                    </span>
                  </div>
                  {isEnded ? (
                    <Badge variant="outline" className="shrink-0 text-[11px]">
                      Encerrado
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatListTime(chat.lastMessageAt)}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="text-muted-foreground truncate text-sm">
                    {chat.lastMessage ?? "Nenhuma mensagem ainda"}
                  </span>
                  {chat.unreadCount > 0 && !isEnded && (
                    <Badge className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-[11px]">
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </Badge>
                  )}
                </div>
                {isExpiringSoon && (
                  <div className="text-warning mt-0.5 text-xs">
                    Encerra em {chat.daysUntilExpiration} dia(s)
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
