"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAnswerStatusCheck } from "@/hooks/mutations/useAnswerStatusCheck";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { matchOutcomeOptions, type MatchOutcome } from "@/types/review";

const POSITIVE: MatchOutcome[] = ["WORKING_TOGETHER", "PROJECT_COMPLETED"];

/**
 * Confirmação da contratação aos 30 dias — respondida pelos DOIS lados
 * (contratante e profissional), cada um independente. Quando o resultado indica
 * que houve trabalho, pede também o valor final combinado (pré-preenchido com a
 * sugestão vinda da proposta / faixa do projeto). WORKING_TOGETHER e
 * PROJECT_COMPLETED adicionam o projeto ao portfólio do profissional quando é o
 * contratante quem responde (o backend cuida disso).
 */
export function StatusCheckForm({
  matchId,
  isJob,
  suggestedAmount,
  onSubmitted,
}: {
  matchId: number;
  isJob?: boolean;
  suggestedAmount?: number | null;
  onSubmitted: () => void;
}) {
  const [outcome, setOutcome] = useState<MatchOutcome | null>(null);
  const [amount, setAmount] = useState(
    suggestedAmount != null ? String(suggestedAmount) : ""
  );
  const answerStatusCheck = useAnswerStatusCheck();

  const workHappened = outcome != null && POSITIVE.includes(outcome);
  const parsedAmount = parseAmount(amount);
  const amountInvalid =
    workHappened && amount.trim() !== "" && parsedAmount == null;
  const canSubmit = outcome != null && (!workHappened || parsedAmount != null);

  function handleConfirm() {
    if (!outcome) return;
    if (workHappened && parsedAmount == null) {
      toast.error("Informe o valor final combinado.");
      return;
    }
    answerStatusCheck.mutate(
      { matchId, outcome, finalAmount: workHappened ? parsedAmount : null },
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

      {workHappened && (
        <div className="space-y-1.5">
          <Label htmlFor="final-amount">
            {isJob
              ? "Salário do primeiro mês combinado (R$)"
              : "Valor final do projeto combinado (R$)"}
          </Label>
          <Input
            id="final-amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={amountInvalid}
          />
          <p
            className={cn(
              "text-xs",
              amountInvalid ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {amountInvalid
              ? "Informe um valor maior que zero."
              : "Informe o valor que as duas partes de fato combinaram — é ele que vale, mesmo que haja uma proposta."}
          </p>
        </div>
      )}

      {workHappened && (
        <p className="bg-primary/5 border-primary/20 text-primary rounded-md border p-3 text-sm">
          ✨ O projeto será adicionado ao portfólio do profissional.
        </p>
      )}

      <Button
        onClick={handleConfirm}
        disabled={!canSubmit || answerStatusCheck.isPending}
        className="self-end"
      >
        {answerStatusCheck.isPending ? "Enviando…" : "Confirmar"}
      </Button>
    </div>
  );
}

function parseAmount(raw: string): number | null {
  const n = Number(raw.trim().replace(",", "."));
  if (Number.isNaN(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}
