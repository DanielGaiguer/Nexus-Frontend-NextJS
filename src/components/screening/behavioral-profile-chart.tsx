"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ScreeningTraitProfileDTO } from "@/types/screening";

const chartConfig = {
  score: { label: "Pontuação", color: "var(--nexus-primary)" },
} satisfies ChartConfig;

/**
 * Perfil de traços de uma etapa comportamental.
 *
 * O AVISO NÃO É OPCIONAL e vive colado ao gráfico: ele vem dentro do próprio
 * ScreeningTraitProfileDTO (o backend monta os dois juntos justamente pra que não dê pra
 * serializar os números sem o texto), e esta é a única tela onde a empresa vê estes valores. Um
 * radar de cinco eixos tem aparência de laudo; sem a ressalva ao lado, é assim que vai ser lido.
 *
 * Escala fixa em 0-100 (`domain`), e não ajustada aos dados: um perfil equilibrado precisa
 * PARECER equilibrado. Com o domínio automático do recharts, cinco valores próximos viram um
 * polígono deformado e sugerem contraste que não existe.
 */
export function BehavioralProfileChart({
  profile,
}: {
  profile: ScreeningTraitProfileDTO;
}) {
  const data = profile.scores.map((score) => ({
    axis: score.label,
    score: score.score,
  }));

  // Um perfil apurado sobre poucos itens vale menos que um apurado sobre dez -- e sem dizer
  // quantos foram, os dois números têm a mesma aparência de precisão.
  const itemCount = profile.scores.reduce(
    (total, score) => total + score.answeredItemCount,
    0
  );

  return (
    <div className="space-y-3">
      <ChartContainer
        config={chartConfig}
        className="mx-auto h-64 w-full max-w-sm"
      >
        <RadarChart data={data}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <PolarGrid />
          <Radar
            dataKey="score"
            fill="var(--color-score)"
            fillOpacity={0.35}
            stroke="var(--color-score)"
          />
        </RadarChart>
      </ChartContainer>

      <ul className="grid gap-1 text-sm sm:grid-cols-2">
        {profile.scores.map((score) => (
          <li key={score.dimension} className="flex justify-between gap-2">
            <span className="text-muted-foreground">{score.label}</span>
            <span className="font-medium">{Math.round(score.score)}</span>
          </li>
        ))}
      </ul>

      <p className="text-muted-foreground text-xs">
        Posição na escala do próprio questionário (0 a 100), a partir de{" "}
        {itemCount} {itemCount === 1 ? "item respondido" : "itens respondidos"}.
        Não é percentil comparado a outros candidatos.
      </p>

      <p className="border-warning/40 bg-warning/10 text-foreground rounded-md border p-3 text-xs">
        {profile.disclaimer}
      </p>
    </div>
  );
}
