"use client";

import { Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MAX_LEN = 2000;

export function ChatComposer({
  disabled,
  canSend,
  onSend,
}: {
  /** Match encerrado — composer nem aparece habilitado. */
  disabled: boolean;
  /** Socket ainda conectando — desabilita só o botão de enviar. */
  canSend: boolean;
  onSend: (content: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSend() {
    const content = value.trim().slice(0, MAX_LEN);
    if (!content || !canSend) return;
    onSend(content);
    setValue("");
  }

  return (
    <div className="border-t p-3">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={disabled}
          maxLength={MAX_LEN}
          rows={1}
          placeholder="Digite sua mensagem..."
          className="max-h-30 min-h-10 flex-1 resize-none"
        />
        <Button
          size="icon"
          className="size-10 shrink-0 rounded-full"
          disabled={disabled || !canSend || !value.trim()}
          onClick={handleSend}
          aria-label="Enviar mensagem"
        >
          <Send className="size-4" />
        </Button>
      </div>
      <div
        className={cn(
          "text-muted-foreground mt-1 px-1 text-right text-xs",
          value.length >= MAX_LEN && "text-destructive"
        )}
      >
        {value.length}/{MAX_LEN}
      </div>
    </div>
  );
}
