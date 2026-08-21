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
        {/* Espelha o gradiente vertical primary->secondary das barras de
            "Matches por mês" do admin-dashboard.html original
            (echarts.graphic.LinearGradient(0,0,0,1,[primary,secondary])). */}
        <defs>
          <linearGradient
            id="monthlyMatchesBarFill"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="var(--nexus-primary)" />
            <stop offset="100%" stopColor="var(--nexus-secondary)" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="value"
          fill="url(#monthlyMatchesBarFill)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
