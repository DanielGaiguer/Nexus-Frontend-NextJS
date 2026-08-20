"use client";

import { AlertTriangle, ArrowLeft, Lock, WifiOff } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { MessageBubble } from "@/components/chat/message-bubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatMatches, useChatMessages } from "@/hooks/queries/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";

export default function ChatWindowPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const id = Number(matchId);

  const { data: chats } = useChatMatches();
  const summary = chats?.find((c) => c.matchId === id);
  const { data: messages, isLoading } = useChatMessages(id);

  const matchActive = summary?.matchActive !== false;
  const { isConnected, error, sendMessage } = useChatSocket(id, matchActive);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-3xl flex-col overflow-hidden rounded-lg border">
      <div className="flex shrink-0 items-center gap-3 border-b p-3">
        <Link
          href="/chat"
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Voltar para conversas"
        >
          <ArrowLeft className="size-5" />
        </Link>
        {summary ? (
          <>
            <Avatar className="size-9 shrink-0">
              <AvatarImage
                src={summary.otherPartyPhotoUrl ?? undefined}
                alt=""
              />
              <AvatarFallback>
                {summary.otherPartyName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                {summary.otherPartyName}
              </div>
              <div className="text-muted-foreground truncate text-xs">
                {summary.projectTitle}
              </div>
            </div>
          </>
        ) : (
          <Skeleton className="h-9 w-40" />
        )}
        {matchActive && !isConnected && (
          <span className="text-warning flex shrink-0 items-center gap-1 text-xs">
            <WifiOff className="size-3.5" />
            Conectando…
          </span>
        )}
      </div>

      {matchActive &&
        summary?.daysUntilExpiration != null &&
        summary.daysUntilExpiration >= 0 &&
        summary.daysUntilExpiration <= 7 && (
          <div className="bg-warning/10 text-warning-foreground flex shrink-0 items-center gap-2 px-4 py-2 text-sm">
            <AlertTriangle className="size-4 shrink-0" />
            Este chat encerra em {summary.daysUntilExpiration} dia(s).
          </div>
        )}

      {!matchActive && (
        <div className="bg-muted text-muted-foreground flex shrink-0 items-center gap-2 px-4 py-2 text-sm">
          <Lock className="size-4 shrink-0" />
          Este chat foi encerrado. O histórico está disponível somente para
          leitura.
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive flex shrink-0 items-center gap-2 px-4 py-2 text-sm">
          <WifiOff className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-11 w-3/5 rounded-2xl ${i % 2 === 0 ? "self-start" : "self-end"}`}
            />
          ))}
        {!isLoading &&
          messages?.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              mine={message.senderType !== summary?.otherPartyType}
            />
          ))}
      </div>

      <ChatComposer
        disabled={!matchActive}
        canSend={isConnected}
        onSend={sendMessage}
      />
    </div>
  );
}
