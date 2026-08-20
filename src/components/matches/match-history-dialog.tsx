"use client";

import { ArrowRight, History } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatchHistory } from "@/hooks/queries/useMatch";

const statusLabel: Record<string, string> = {
  WAITING: "Aguardando",
  COMPANY_INTERESTED: "Empresa demonstrou interesse",
  PROFESSIONAL_INTERESTED: "Profissional demonstrou interesse",
  MATCHED: "Match confirmado",
  REJECTED: "Recusado",
};

/** "Ver histórico" — timeline de mudanças de status do match. Espelha o modal `.history-trigger` do app antigo. */
export function MatchHistoryDialog({ matchId }: { matchId: number }) {
  const [open, setOpen] = useState(false);
  const { data: history, isLoading } = useMatchHistory(matchId, open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="size-4" />
          Ver histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Histórico do match</DialogTitle>
          <DialogDescription>
            Linha do tempo de mudanças de status.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        )}

        {!isLoading && (!history || history.length === 0) && (
          <p className="text-muted-foreground text-sm">
            Nenhum evento registrado ainda.
          </p>
        )}

        {!isLoading && history && history.length > 0 && (
          <ol className="flex flex-col gap-3">
            {history.map((entry, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1 font-medium">
                    {entry.fromStatus && (
                      <>
                        <span className="text-muted-foreground">
                          {statusLabel[entry.fromStatus] ?? entry.fromStatus}
                        </span>
                        <ArrowRight className="text-muted-foreground size-3" />
                      </>
                    )}
                    <span>{statusLabel[entry.toStatus] ?? entry.toStatus}</span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {new Date(entry.changedAt).toLocaleString("pt-BR")}
                    {entry.changedBy && ` · ${entry.changedBy}`}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
