import { Check, CheckCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** Campos que a bolha precisa — serve tanto MessageDTO (chat de match) quanto
 * SupportMessageDTO (chat de suporte). */
interface BubbleMessage {
  senderName: string;
  senderPhotoUrl: string | null;
  content: string;
  sentAt: string;
  read: boolean;
}

function formatTime(sentAt: string) {
  const date = new Date(sentAt);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const hhmm = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  // Diferente do nexus-chat.js original (que sempre dizia "ontem HH:mm" pra
  // qualquer mensagem que não fosse de hoje, mesmo semanas atrás) — aqui a
  // data completa aparece pra mensagens mais antigas, só "hoje" fica com
  // hora só.
  if (sameDay) return hhmm;
  return `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ${hhmm}`;
}

export function MessageBubble({
  message,
  mine,
}: {
  message: BubbleMessage;
  mine: boolean;
}) {
  return (
    <div
      className={cn(
        "flex max-w-[75%] gap-2",
        mine ? "flex-row-reverse self-end" : "self-start"
      )}
    >
      {!mine && (
        <Avatar className="size-7 shrink-0 self-end">
          <AvatarImage src={message.senderPhotoUrl ?? undefined} alt="" />
          <AvatarFallback className="text-xs">
            {message.senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col", mine && "items-end")}>
        {!mine && (
          <span className="text-muted-foreground mb-0.5 px-1 text-xs">
            {message.senderName}
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
            mine
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          {message.content}
        </div>
        <span className="text-muted-foreground mt-0.5 flex items-center gap-1 px-1 text-[11px]">
          {formatTime(message.sentAt)}
          {mine &&
            (message.read ? (
              <CheckCheck className="size-3" />
            ) : (
              <Check className="size-3" />
            ))}
        </span>
      </div>
    </div>
  );
}
