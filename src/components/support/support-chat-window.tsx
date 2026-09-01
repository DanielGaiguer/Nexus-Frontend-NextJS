"use client";

import { ArrowLeft, LifeBuoy, Lock, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { ChatComposer } from "@/components/chat/chat-composer";
import { MessageBubble } from "@/components/chat/message-bubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCloseSupportConversation } from "@/hooks/mutations/useSupportActions";
import {
  useSupportConversation,
  useSupportMessages,
} from "@/hooks/queries/useSupport";
import { useSession } from "@/hooks/queries/useSession";
import { useSupportChatSocket } from "@/hooks/useSupportChatSocket";
import { ApiError } from "@/lib/api-client";

export function SupportChatWindow({
  conversationId,
  side,
}: {
  conversationId: number;
  side: "admin" | "user";
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: conversation, isLoading: loadingConv } = useSupportConversation(
    side,
    conversationId
  );
  const { data: messages, isLoading } = useSupportMessages(side, conversationId);
  const closeConversation = useCloseSupportConversation();

  const isOpen = conversation?.status === "OPEN";
  const { isConnected, error, sendMessage } = useSupportChatSocket(
    conversationId,
    !!isOpen,
    side
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const roleLabel =
    conversation?.userRole === "PROFESSIONAL"
      ? "Profissional"
      : conversation?.userRole === "COMPANY"
        ? "Contratante"
        : (conversation?.userRole ?? "");
  const title =
    side === "admin"
      ? (conversation?.userName ?? "Conversa de suporte")
      : "Suporte Nexus";
  const subtitle =
    conversation?.subject ??
    (side === "admin" ? roleLabel : "Atendimento");

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-[848px] flex-col overflow-hidden rounded-lg border">
      <div className="flex shrink-0 items-center gap-3 border-b p-3">
        <button
          type="button"
          onClick={() => router.push(side === "admin" ? "/admin/support" : "/support")}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </button>
        {loadingConv ? (
          <Skeleton className="h-9 w-40" />
        ) : (
          <>
            <Avatar className="size-9 shrink-0">
              <AvatarImage
                src={
                  side === "admin"
                    ? (conversation?.userPhotoUrl ?? undefined)
                    : undefined
                }
                alt=""
              />
              <AvatarFallback>
                {side === "admin" ? (
                  title.charAt(0).toUpperCase()
                ) : (
                  <LifeBuoy className="size-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{title}</div>
              <div className="text-muted-foreground truncate text-xs">
                {subtitle}
              </div>
            </div>
            {!isOpen && (
              <Badge variant="outline" className="shrink-0 text-[11px]">
                Encerrada
              </Badge>
            )}
            {side === "admin" && isOpen && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Fechar conversa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Fechar esta conversa?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O histórico continua acessível para as duas partes, mas
                      ninguém poderá enviar novas mensagens.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={closeConversation.isPending}
                      onClick={() =>
                        closeConversation.mutate(conversationId, {
                          onSuccess: () => toast.success("Conversa fechada."),
                          onError: (e) =>
                            toast.error(
                              e instanceof ApiError
                                ? e.message
                                : "Não foi possível fechar."
                            ),
                        })
                      }
                    >
                      Fechar conversa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        )}
        {isOpen && !isConnected && (
          <span className="text-warning flex shrink-0 items-center gap-1 text-xs">
            <WifiOff className="size-3.5" />
            Conectando…
          </span>
        )}
      </div>

      {!isOpen && !loadingConv && (
        <div className="bg-muted text-muted-foreground flex shrink-0 items-center gap-2 px-4 py-2 text-sm">
          <Lock className="size-4 shrink-0" />
          Esta conversa foi encerrada. O histórico está disponível somente para
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
        className="thin-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-11 w-3/5 rounded-2xl ${
                i % 2 === 0 ? "self-start" : "self-end"
              }`}
            />
          ))}
        {!isLoading && messages?.length === 0 && (
          <p className="text-muted-foreground m-auto text-sm">
            Nenhuma mensagem ainda.
          </p>
        )}
        {!isLoading &&
          messages?.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              mine={session != null && message.senderId === session.id}
            />
          ))}
      </div>

      <ChatComposer
        disabled={!isOpen}
        canSend={isConnected}
        onSend={sendMessage}
      />
    </div>
  );
}
