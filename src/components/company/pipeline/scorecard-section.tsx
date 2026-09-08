"use client";

import { Star, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StarRatingInput } from "@/components/reviews/star-rating-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUpsertMyEvaluation } from "@/hooks/mutations/useCandidateDetailActions";
import { useCandidateEvaluations } from "@/hooks/queries/useCandidateDetail";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { CandidateEvaluationItemDTO } from "@/types/candidate";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i <= value
              ? "fill-warning text-warning"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  );
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

/** Editor do parecer do próprio membro. Remontado (via `key` no pai) sempre que o parecer salvo muda. */
function MyEvaluationEditor({
  initial,
  onSave,
  pending,
}: {
  initial: CandidateEvaluationItemDTO | null;
  onSave: (rating: number, comment: string | null) => void;
  pending: boolean;
}) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [comment, setComment] = useState(initial?.comment ?? "");

  const dirty =
    rating !== (initial?.rating ?? 0) ||
    comment.trim() !== (initial?.comment ?? "").trim();

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="text-sm font-medium">
        {initial ? "Sua avaliação" : "Dê sua avaliação"}
      </div>
      <StarRatingInput value={rating} onChange={setRating} />
      <Textarea
        rows={3}
        placeholder="Comentário (opcional) — só a sua equipe vê isto"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        aria-label="Comentário da sua avaliação"
      />
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={pending || rating < 1 || !dirty}
          onClick={() => onSave(rating, comment.trim() || null)}
        >
          {pending
            ? "Salvando…"
            : initial
              ? "Atualizar avaliação"
              : "Salvar avaliação"}
        </Button>
      </div>
    </div>
  );
}

/**
 * Scorecard colaborativo do candidato: o parecer do membro logado (upsert) + o consolidado
 * (média ao vivo, quantidade, pareceres dos outros membros com nome). Este número (1–5) é da
 * EQUIPE e não se mistura com o matchScore algorítmico (0–100) -- ver CandidateDetailDialog.
 */
export function ScorecardSection({
  projectId,
  matchId,
}: {
  projectId: number;
  matchId: number;
}) {
  const { data: summary, isLoading } = useCandidateEvaluations(
    projectId,
    matchId
  );
  const upsert = useUpsertMyEvaluation(projectId, matchId);

  const mine = summary?.items.find((i) => i.mine) ?? null;
  const others = (summary?.items ?? []).filter((i) => !i.mine);

  function save(rating: number, comment: string | null) {
    upsert.mutate(
      { rating, comment },
      {
        onSuccess: () => toast.success("Avaliação registrada."),
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível salvar a avaliação."
          ),
      }
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Users className="size-4" />
        Scorecard da equipe
      </h3>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <MyEvaluationEditor
            key={mine ? `${mine.rating}-${mine.updatedAt}` : "new"}
            initial={mine}
            onSave={save}
            pending={upsert.isPending}
          />

          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Consolidado</span>
              <span className="text-muted-foreground text-xs">
                {summary?.count ?? 0} parecer(es)
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">
                {summary?.average != null ? summary.average.toFixed(1) : "—"}
              </span>
              <span className="text-muted-foreground text-sm">/ 5</span>
              {summary?.average != null && (
                <Stars value={Math.round(summary.average)} />
              )}
            </div>

            {others.length > 0 && (
              <ul className="mt-3 space-y-2 border-t pt-3">
                {others.map((item, idx) => (
                  <li key={item.evaluatorMemberId ?? `orphan-${idx}`}>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-foreground font-medium">
                        {item.evaluatorLabel}
                      </span>
                      <Stars value={item.rating} />
                      <span>· {formatWhen(item.createdAt)}</span>
                    </div>
                    {item.comment && (
                      <p className="mt-0.5 text-sm whitespace-pre-wrap">
                        {item.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
