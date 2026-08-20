import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  scoreLabel,
  simulateScore,
  type ScoreSimulatorInput,
} from "@/lib/score-simulator";
import { cn } from "@/lib/utils";

const scoreColorClass = (score: number) =>
  score >= 85
    ? "text-success"
    : score >= 70
      ? "text-primary"
      : score >= 50
        ? "text-warning"
        : "text-destructive";

/** Porte do widget "Score simulado" do modal de edição — estimativa client-side, ver lib/score-simulator.ts. */
export function ScoreSimulatorCard(input: ScoreSimulatorInput) {
  const { score, breakdown } = simulateScore(input);

  return (
    <Card className="bg-muted/40 gap-3 py-4">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
            Score simulado
          </CardTitle>
          <p className="text-muted-foreground text-[11px]">
            baseado nas vagas abertas
          </p>
        </div>
        <div className="text-right">
          <div
            className={cn(
              "text-2xl leading-none font-extrabold",
              scoreColorClass(score)
            )}
          >
            {score}%
          </div>
          <div className={cn("text-xs font-semibold", scoreColorClass(score))}>
            {scoreLabel(score)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <Progress value={score} className="h-1.5" />
        {breakdown.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {item.label}{" "}
                <span className="text-muted-foreground/70">
                  ×{Math.round(item.weight * 100)}%
                </span>
              </span>
              <span className="font-semibold">{item.value}</span>
            </div>
            <Progress value={item.value} className="h-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
