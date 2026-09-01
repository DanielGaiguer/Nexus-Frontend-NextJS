"use client";

import { useState } from "react";

import { StatusCheckForm } from "@/components/matches/status-check-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePendingStatusCheck } from "@/hooks/queries/useReviews";

/**
 * Auto-abre no dashboard (contratante OU profissional) quando há uma janela de
 * confirmação pós-contratação aberta que este lado ainda não respondeu. Tem
 * prioridade sobre PendingReviewDialog.
 */
export function PendingStatusCheckDialog() {
  const { data: pending } = usePendingStatusCheck(true);
  const [dismissed, setDismissed] = useState(false);

  const open = !dismissed && !!pending;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && setDismissed(true)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirme sua contratação</DialogTitle>
          {pending && (
            <DialogDescription>
              Sua contratação com {pending.otherPartyName} no projeto &quot;
              {pending.projectTitle}&quot; completou 30 dias. Confirme se o
              trabalho foi concluído e o valor final combinado.
            </DialogDescription>
          )}
        </DialogHeader>
        {pending && (
          <StatusCheckForm
            matchId={pending.matchId}
            isJob={pending.opportunityType === "JOB"}
            suggestedAmount={pending.suggestedAmount}
            onSubmitted={() => setDismissed(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
