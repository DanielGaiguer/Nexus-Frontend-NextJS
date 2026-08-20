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
 * Auto-abre no dashboard da empresa quando há um match com 14+ dias ainda
 * sem resposta do status check — espelha #statusCheckModal de
 * company-dashboard.html. Tem prioridade sobre PendingReviewDialog (match
 * ainda ativo, é mais urgente).
 */
export function PendingStatusCheckDialog() {
  const { data: pending } = usePendingStatusCheck(true);
  const [dismissed, setDismissed] = useState(false);

  const open = !dismissed && !!pending;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && setDismissed(true)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Como está indo o match?</DialogTitle>
          {pending && (
            <DialogDescription>
              Seu match com {pending.professionalName} no projeto &quot;
              {pending.projectTitle}
              &quot; completa 30 dias em breve.
            </DialogDescription>
          )}
        </DialogHeader>
        {pending && (
          <StatusCheckForm
            matchId={pending.matchId}
            onSubmitted={() => setDismissed(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
