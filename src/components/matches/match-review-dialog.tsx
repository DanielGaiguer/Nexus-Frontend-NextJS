"use client";

import { MessageCircleOff, Star } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AuthorType } from "@/types/review";

// Texto cru que o backend manda (ReviewService, em inglês) — ReviewForm
// repassa isso via onBlockedError (error.reason), não a mensagem já
// traduzida (error.message), justamente pra essa comparação continuar
// funcionando independente da tradução.
const NEEDS_STATUS_CHECK_MSG =
  "Please answer the match status check before reviewing.";
const NO_CONTACT_MSG = "Reviews are not available when there was no contact.";

/**
 * "Avaliar" a partir de qualquer lista de matches -- antes navegava pra
 * /matches/[matchId]/review (página cheia, ver ReviewPageContent); agora
 * abre o mesmo formulário num diálogo, sem sair da lista. Mesma lógica de
 * bloqueio (status check pendente / sem contato) que a página tinha.
 */
export function MatchReviewDialog({
  matchId,
  authorType,
  projectTitle,
  open: openProp,
  onOpenChange,
  hideTrigger,
}: {
  matchId: number;
  authorType: AuthorType;
  projectTitle: string;
  /** Modo controlado (ex.: item de menu). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const [blockedReason, setBlockedReason] = useState<
    "status-check" | "no-contact" | null
  >(null);

  function setOpen(next: boolean) {
    onOpenChange?.(next);
    setOpenState(next);
    if (!next) setBlockedReason(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost">
            <Star className="size-4" />
            Avaliar
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="thin-scrollbar max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Avaliar Match</DialogTitle>
          <DialogDescription>Avaliando: {projectTitle}</DialogDescription>
        </DialogHeader>

        {blockedReason === "status-check" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-muted-foreground text-sm">
                Antes de avaliar, responda como foi o match.
              </p>
              <Button asChild>
                <Link href={`/matches/${matchId}/status-check`}>
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

        {!blockedReason && (
          <ReviewForm
            matchId={matchId}
            authorType={authorType}
            cancelLabel="Cancelar"
            onCancel={() => setOpen(false)}
            onSubmitted={() => setOpen(false)}
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
