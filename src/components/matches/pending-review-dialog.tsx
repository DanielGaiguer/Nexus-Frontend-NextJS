"use client";

import { useState } from "react";

import { ReviewForm } from "@/components/reviews/review-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePendingReview } from "@/hooks/queries/useReviews";
import type { AuthorType } from "@/types/review";

/**
 * Auto-abre no dashboard quando há um match encerrado ainda sem avaliação
 * deste lado — espelha o modal #reviewModal de pro-dashboard.html /
 * company-dashboard.html. `active` deixa o dashboard decidir prioridade
 * (a empresa tem também o status-check, que vem primeiro).
 */
export function PendingReviewDialog({
  role,
  active,
}: {
  role: "professional" | "company";
  active: boolean;
}) {
  const { data: pending } = usePendingReview(role);
  const [dismissed, setDismissed] = useState(false);

  const open = active && !dismissed && !!pending;
  const authorType: AuthorType =
    role === "professional" ? "PROFESSIONAL" : "COMPANY";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && setDismissed(true)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Avaliar Match</DialogTitle>
          {pending && (
            <DialogDescription>
              Seu match com {pending.otherPartyName} no projeto &quot;
              {pending.projectTitle}
              &quot; foi encerrado. Compartilhe sua experiência.
            </DialogDescription>
          )}
        </DialogHeader>
        {pending && (
          <ReviewForm
            matchId={pending.matchId}
            authorType={authorType}
            onSubmitted={() => setDismissed(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
