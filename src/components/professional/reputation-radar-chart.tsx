"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ReputationSummaryDTO } from "@/types/analytics";

const chartConfig = {
  value: { label: "Nota", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ReputationRadarChart({
  reputation,
}: {
  reputation: ReputationSummaryDTO;
}) {
  const data = [
    { axis: "Comunicação", value: reputation.communication ?? 0 },
    { axis: "Confiabilidade", value: reputation.reliability ?? 0 },
    { axis: "Pontualidade", value: reputation.punctuality ?? 0 },
    { axis: "Profissionalismo", value: reputation.professionalism ?? 0 },
  ];

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto h-56 w-full max-w-xs"
    >
      <RadarChart data={data}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
        <PolarGrid />
        <Radar
          dataKey="value"
          fill="var(--color-value)"
          fillOpacity={0.35}
          stroke="var(--color-value)"
        />
      </RadarChart>
    </ChartContainer>
  );
}
