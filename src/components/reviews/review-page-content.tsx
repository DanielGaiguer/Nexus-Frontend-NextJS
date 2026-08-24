"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircleOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ReviewForm } from "@/components/reviews/review-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatch } from "@/hooks/queries/useMatch";
import type { AuthorType } from "@/types/review";

// Texto cru que o backend manda (ReviewService, em inglês) — ReviewForm
// repassa isso via onBlockedError (error.reason), não a mensagem já
// traduzida (error.message), justamente pra essa comparação continuar
// funcionando independente da tradução.
const NEEDS_STATUS_CHECK_MSG =
  "Please answer the match status check before reviewing.";
const NO_CONTACT_MSG = "Reviews are not available when there was no contact.";

const matchesUrlByRole: Record<AuthorType, string> = {
  PROFESSIONAL: "/pro/matches",
  COMPANY: "/company/matches",
};

/** Espelha matches/review.html — inclui os banners needsStatusCheck/noContact do backend. */
export function ReviewPageContent({
  matchId,
  authorType,
}: {
  matchId: number;
  authorType: AuthorType;
}) {
  const router = useRouter();
  const { data: match, isLoading } = useMatch(matchId);
  const [submitted, setSubmitted] = useState(false);
  const [blockedReason, setBlockedReason] = useState<
    "status-check" | "no-contact" | null
  >(null);

  const matchesUrl = matchesUrlByRole[authorType];

  useEffect(() => {
    if (!submitted) return;
    const timeout = setTimeout(() => router.push(matchesUrl), 2000);
    return () => clearTimeout(timeout);
  }, [submitted, router, matchesUrl]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      {submitted ? (
        <div className="bg-success/10 text-success rounded-md p-4 text-sm">
          Avaliação enviada com sucesso! Redirecionando…
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </button>

          <div className="bg-muted/50 text-muted-foreground rounded-md border p-3 text-sm">
            📋 Este match foi encerrado. Compartilhe sua experiência.
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Avaliar Match</h1>
            {isLoading ? (
              <Skeleton className="mt-1 h-5 w-48" />
            ) : (
              <p className="text-muted-foreground text-sm">
                Avaliando: {match?.project.title}
              </p>
            )}
          </div>

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

          {!blockedReason && !isLoading && (
            <ReviewForm
              matchId={matchId}
              authorType={authorType}
              cancelHref={matchesUrl}
              onSubmitted={() => setSubmitted(true)}
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
          {!isLoading && !match && (
            <p className="text-destructive text-sm">Match não encontrado.</p>
          )}
        </>
      )}
    </div>
  );
}
