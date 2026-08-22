"use client";

import { TrendingUp } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/empty-state";
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
  totalMatches: { label: "Total", color: "var(--nexus-primary)" },
  confirmedMatches: { label: "Confirmados", color: "var(--nexus-success)" },
  rejectedMatches: { label: "Rejeitados", color: "var(--nexus-danger)" },
} satisfies ChartConfig;

export function MatchesTrendChart({ data }: { data: MonthlyMatchDTO[] }) {
  // Um AreaChart com um único ponto não tem o que interpolar — o Recharts
  // acaba desenhando um bloco sólido preenchendo a largura toda, o que
  // parece quebrado (comum em conta nova, com só um mês de atividade).
  // Uma tendência de verdade precisa de pelo menos 2 pontos.
  if (data.length < 2) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Ainda não há tendência para mostrar"
        description="Volte aqui depois de alguns meses de atividade para ver a evolução dos seus matches."
      />
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <ComposedChart data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="monthLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {/* Total e Confirmados: linha sólida com área de gradiente, igual ao lineChart antigo. */}
        <Area
          dataKey="totalMatches"
          type="monotone"
          fill="var(--color-totalMatches)"
          fillOpacity={0.15}
          stroke="var(--color-totalMatches)"
          strokeWidth={2}
        />
        <Area
          dataKey="confirmedMatches"
          type="monotone"
          fill="var(--color-confirmedMatches)"
          fillOpacity={0.15}
          stroke="var(--color-confirmedMatches)"
          strokeWidth={2}
        />
        {/* Rejeitados: linha tracejada sem preenchimento, igual ao lineChart antigo. */}
        <Line
          dataKey="rejectedMatches"
          type="monotone"
          stroke="var(--color-rejectedMatches)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
