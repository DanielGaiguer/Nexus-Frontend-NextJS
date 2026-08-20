"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MonthlyMatchDTO } from "@/types/analytics";

const chartConfig = {
  totalMatches: { label: "Total", color: "var(--chart-1)" },
  confirmedMatches: { label: "Confirmados", color: "var(--chart-4)" },
  rejectedMatches: { label: "Recusados", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function MatchesTrendChart({ data }: { data: MonthlyMatchDTO[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <AreaChart data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="monthLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="totalMatches"
          type="monotone"
          fill="var(--color-totalMatches)"
          fillOpacity={0.15}
          stroke="var(--color-totalMatches)"
        />
        <Area
          dataKey="confirmedMatches"
          type="monotone"
          fill="var(--color-confirmedMatches)"
          fillOpacity={0.15}
          stroke="var(--color-confirmedMatches)"
        />
        <Area
          dataKey="rejectedMatches"
          type="monotone"
          fill="var(--color-rejectedMatches)"
          fillOpacity={0.15}
          stroke="var(--color-rejectedMatches)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
