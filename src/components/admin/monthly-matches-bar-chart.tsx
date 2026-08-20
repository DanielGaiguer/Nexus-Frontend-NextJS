"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MonthlyMatchCountDTO } from "@/types/admin";

const chartConfig = {
  value: { label: "Matches", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function MonthlyMatchesBarChart({
  data,
}: {
  data: MonthlyMatchCountDTO[];
}) {
  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <BarChart data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
