"use client";

import { OpenSupportTicketDialog } from "@/components/support/open-support-ticket-dialog";
import { SupportConversationList } from "@/components/support/support-conversation-list";

export default function SupportPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suporte</h1>
          <p className="text-muted-foreground text-sm">
            Fale com o suporte do Nexus. Abra um chamado ou continue uma
            conversa já iniciada.
          </p>
        </div>
        <OpenSupportTicketDialog />
      </div>
      <SupportConversationList side="user" />
    </div>
  );
}
