"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAnswerStatusCheck } from "@/hooks/mutations/useAnswerStatusCheck";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { matchOutcomeOptions, type MatchOutcome } from "@/types/review";

/**
 * Espelha matches/status-check.html — só a empresa responde (ver
 * MatchStatusCheckController#answerStatusCheck no backend). WORKING_TOGETHER
 * e PROJECT_COMPLETED adicionam o projeto ao portfólio do profissional
 * automaticamente do lado do backend, daí o aviso.
 */
export function StatusCheckForm({
  matchId,
  onSubmitted,
}: {
  matchId: number;
  onSubmitted: () => void;
}) {
  const [outcome, setOutcome] = useState<MatchOutcome | null>(null);
  const answerStatusCheck = useAnswerStatusCheck();

  function handleConfirm() {
    if (!outcome) return;
    answerStatusCheck.mutate(
      { matchId, outcome },
      {
        onSuccess: () => {
          toast.success("Resposta registrada.");
          onSubmitted();
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível registrar a resposta."
          ),
      }
    );
  }

  const showPortfolioHint =
    outcome === "WORKING_TOGETHER" || outcome === "PROJECT_COMPLETED";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {matchOutcomeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setOutcome(option.value)}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition-colors",
              outcome === option.value
                ? "border-primary bg-primary/5"
                : "hover:bg-accent"
            )}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span>{option.emoji}</span>
              {option.title}
            </span>
            <span className="text-muted-foreground text-xs">
              {option.description}
            </span>
          </button>
        ))}
      </div>

      {showPortfolioHint && (
        <p className="bg-primary/5 border-primary/20 text-primary rounded-md border p-3 text-sm">
          ✨ O projeto será adicionado ao portfólio do profissional.
        </p>
      )}

      <Button
        onClick={handleConfirm}
        disabled={!outcome || answerStatusCheck.isPending}
        className="self-end"
      >
        Confirmar
      </Button>
    </div>
  );
}
