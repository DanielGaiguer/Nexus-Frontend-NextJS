"use client";

import { MessageCircleOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ReviewForm } from "@/components/reviews/review-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePendingReview } from "@/hooks/queries/useReviews";
import type { AuthorType } from "@/types/review";

// Texto cru que o backend manda (ReviewService, em inglês) — ReviewForm
// repassa isso via onBlockedError (error.reason), não a mensagem já
// traduzida (error.message), justamente pra essa comparação continuar
// funcionando independente da tradução.
const NEEDS_STATUS_CHECK_MSG =
  "Please answer the match status check before reviewing.";
const NO_CONTACT_MSG = "Reviews are not available when there was no contact.";

/**
 * Auto-abre no dashboard quando há um match encerrado ainda sem avaliação
 * deste lado — espelha o modal #reviewModal de pro-dashboard.html /
 * company-dashboard.html. `active` deixa o dashboard decidir prioridade
 * (a empresa tem também o status-check, que vem primeiro). Mesmo padrão de
 * bloqueio (status check pendente / sem contato) de MatchReviewDialog —
 * mesmo com o pending review resolvido do lado do backend, o mesmo par de
 * condições de bloqueio pode acontecer.
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
  const [blockedReason, setBlockedReason] = useState<
    "status-check" | "no-contact" | null
  >(null);

  const open = active && !dismissed && !!pending;
  const authorType: AuthorType =
    role === "professional" ? "PROFESSIONAL" : "COMPANY";

  function dismiss() {
    setDismissed(true);
    setBlockedReason(null);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent className="thin-scrollbar max-h-[85vh] overflow-y-auto sm:max-w-lg">
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

        {blockedReason === "status-check" && pending && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-muted-foreground text-sm">
                Antes de avaliar, responda como foi o match.
              </p>
              <Button asChild>
                <Link href={`/matches/${pending.matchId}/status-check`}>
                  Responder agora
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {blockedReason === "no-contact" && (
          <EmptyState
            icon={MessageCircleOff}
            title="Avaliação indisponível"
            description="Como não houve contato estabelecido, a avaliação não está disponível para este match."
          />
        )}

        {!blockedReason && pending && (
          <ReviewForm
            matchId={pending.matchId}
            authorType={authorType}
            cancelLabel="Responder depois"
            onCancel={dismiss}
            onSubmitted={dismiss}
            onBlockedError={(reason) => {
              if (reason === NEEDS_STATUS_CHECK_MSG) {
                setBlockedReason("status-check");
                return true;
              }
              if (reason === NO_CONTACT_MSG) {
                setBlockedReason("no-contact");
                return true;
              }
              return false;
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
