import { Progress } from "@/components/ui/progress";
import type { ScoreBreakdownDTO } from "@/types/match";

const breakdownLabels = {
  skills: "Skills",
  budget: "Orçamento",
  history: "Histórico",
  reputation: "Reputação",
} as const;

/** Grid dos "índices" de compatibilidade (skills/orçamento/histórico/reputação) -- mesmo bloco
 * usado nos cards de match, proposta e processo seletivo, sempre logo abaixo do cabeçalho com o
 * ScoreRing. */
export function ScoreBreakdownGrid({
  breakdown,
}: {
  breakdown: ScoreBreakdownDTO;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3 sm:grid-cols-4">
      {(Object.keys(breakdownLabels) as (keyof typeof breakdownLabels)[]).map(
        (key) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {breakdownLabels[key]}
              </span>
              <span className="text-primary tabular-nums">
                {Math.round(breakdown[key] ?? 0)}
              </span>
            </div>
            <Progress value={breakdown[key] ?? 0} className="h-1.5" />
          </div>
        )
      )}
    </div>
  );
}
