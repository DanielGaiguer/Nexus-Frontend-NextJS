"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  count: { label: "Oportunidades", color: "var(--chart-1)" },
} satisfies ChartConfig;

/**
 * O "losango de skills" — não existe endpoint de demanda agregada
 * system-wide no backend (`SkillDemandDTO` só existe por profissional/
 * empresa), então a demanda é agregada aqui a partir de
 * `GET /api/admin/projects` (contagem de ocorrências de cada skill exigida
 * em todas as oportunidades da plataforma) — mesma fonte de dado real,
 * só que agregada no client em vez de no SQL.
 */
export function SkillDemandRadarChart({
  data,
}: {
  data: { skillName: string; count: number }[];
}) {
  const top = data
    .slice(0, 8)
    .map((d) => ({ axis: d.skillName, count: d.count }));

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto h-72 w-full max-w-md"
    >
      <RadarChart data={top}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
        <PolarGrid />
        <Radar
          dataKey="count"
          fill="var(--color-count)"
          fillOpacity={0.35}
          stroke="var(--color-count)"
        />
      </RadarChart>
    </ChartContainer>
  );
}
