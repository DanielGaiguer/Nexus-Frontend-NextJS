import { clampScore, cn } from "@/lib/utils";

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Porte do anel de score em SVG (nexus-score-ring) — usado nos cards de match/oportunidade. */
export function ScoreRing({
  score: rawScore,
  size = 96,
}: {
  score: number;
  size?: number;
}) {
  const score = Math.round(clampScore(rawScore));
  const tier = score >= 85 ? "high" : score >= 70 ? "medium" : "low";
  const colorClass = {
    high: "text-success",
    medium: "text-warning",
    low: "text-destructive",
  }[tier];
  const tierLabel = { high: "Alto", medium: "Médio", low: "Baixo" }[tier];

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-muted-foreground text-[10px] font-bold tracking-wide uppercase">
        Score
      </span>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 110 110"
          className="-rotate-90"
        >
          <circle
            cx="55"
            cy="55"
            r={RADIUS}
            className="stroke-border fill-none"
            strokeWidth="5"
          />
          <circle
            cx="55"
            cy="55"
            r={RADIUS}
            className={cn(
              "fill-none transition-[stroke-dashoffset] duration-500",
              colorClass
            )}
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums">{score}%</span>
          <span className={cn("text-[10px] font-semibold", colorClass)}>
            {tierLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
