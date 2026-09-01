"use client";

import { useState } from "react";

import { OpenSupportConversationDialog } from "@/components/admin/open-support-conversation-dialog";
import { SupportConversationList } from "@/components/support/support-conversation-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SupportConversationStatus } from "@/types/support";

const FILTERS: { value: SupportConversationStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "OPEN", label: "Abertas" },
  { value: "CLOSED", label: "Encerradas" },
];

export default function AdminSupportPage() {
  const [status, setStatus] = useState<SupportConversationStatus | "ALL">(
    "OPEN"
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suporte</h1>
          <p className="text-muted-foreground text-sm">
            Conversas de suporte com profissionais e contratantes.
          </p>
        </div>
        <OpenSupportConversationDialog />
      </div>

      <div className="max-w-[180px]">
        <Select
          value={status}
          onValueChange={(v) =>
            setStatus(v as SupportConversationStatus | "ALL")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SupportConversationList side="admin" status={status} />
    </div>
  );
}
