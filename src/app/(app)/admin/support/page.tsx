"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { OpenSupportConversationDialog } from "@/components/admin/open-support-conversation-dialog";
import { SupportConversationList } from "@/components/support/support-conversation-list";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SupportConversationStatus } from "@/types/support";

const STATUS_FILTERS: {
  value: SupportConversationStatus | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "Todas" },
  { value: "OPEN", label: "Abertas" },
  { value: "CLOSED", label: "Encerradas" },
];

const ROLE_FILTERS: {
  value: "ALL" | "COMPANY" | "PROFESSIONAL";
  label: string;
}[] = [
  { value: "ALL", label: "Todos" },
  { value: "COMPANY", label: "Contratantes" },
  { value: "PROFESSIONAL", label: "Profissionais" },
];

export default function AdminSupportPage() {
  const [status, setStatus] = useState<SupportConversationStatus | "ALL">(
    "OPEN"
  );
  const [role, setRole] = useState<"ALL" | "COMPANY" | "PROFESSIONAL">("ALL");
  const [search, setSearch] = useState("");

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

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1 space-y-1">
          <Label htmlFor="support-search" className="text-xs">
            Buscar
          </Label>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              id="support-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, assunto ou mensagem…"
              className="pl-8"
            />
          </div>
        </div>

        <div className="w-[160px] space-y-1">
          <Label className="text-xs">Tipo de usuário</Label>
          <Select
            value={role}
            onValueChange={(v) =>
              setRole(v as "ALL" | "COMPANY" | "PROFESSIONAL")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[150px] space-y-1">
          <Label className="text-xs">Status</Label>
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
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SupportConversationList
        side="admin"
        status={status}
        role={role}
        search={search}
      />
    </div>
  );
}
