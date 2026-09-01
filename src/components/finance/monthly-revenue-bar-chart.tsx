"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MonthlyAmountDTO } from "@/types/finance";

const chartConfig = {
  value: { label: "Receita", color: "var(--chart-1)" },
} satisfies ChartConfig;

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Receita de comissão por mês (cobranças pagas). Mesmo estilo do gráfico
 * "Matches por mês" do painel do Admin — gradiente vertical primary->secondary.
 */
export function MonthlyRevenueBarChart({ data }: { data: MonthlyAmountDTO[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <BarChart data={data} margin={{ left: 12, right: 12 }}>
        <defs>
          <linearGradient
            id="monthlyRevenueBarFill"
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
        <ChartTooltip
          content={
            <ChartTooltipContent formatter={(value) => brl(Number(value))} />
          }
        />
        <Bar
          dataKey="value"
          fill="url(#monthlyRevenueBarFill)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
