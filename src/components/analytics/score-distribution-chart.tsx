"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { ScoreDistributionDTO } from "@/types/analytics";

const chartConfig = {
  count: { label: "Registros", color: "var(--nexus-primary)" },
} satisfies ChartConfig;

// Vermelho -> verde conforme a faixa de score sobe, igual à paleta do
// scoreBarChart antigo. Calculada pelo início da faixa (não pelo índice no
// array) para não depender da ordem em que o backend manda os dados.
function colorForRange(range: string): string {
  const start = parseInt(range, 10) || 0;
  if (start >= 80) return "var(--nexus-success)";
  if (start >= 60) return "var(--nexus-primary)";
  if (start >= 40) return "#6b8cff";
  if (start >= 20) return "var(--nexus-warning)";
  return "var(--nexus-danger)";
}

type ChartDatum = ScoreDistributionDTO & { label: string };

function ScoreTooltip({
  active,
  payload,
  unitLabel,
}: {
  active?: boolean;
  payload?: { payload: ChartDatum }[];
  unitLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{d.range}</div>
      <div className="text-muted-foreground">
        {d.count} {unitLabel} ({d.percentage.toFixed(1)}%)
      </div>
    </div>
  );
}

/**
 * Barras horizontais por faixa de score — espelha o `scoreBarChart` do
 * dashboard antigo: eixo Y categórico (faixa), rótulo "N (P%)" ao lado de
 * cada barra, cor por faixa (vermelho a verde).
 */
export function ScoreDistributionChart({
  data,
  unitLabel = "registros",
}: {
  data: ScoreDistributionDTO[];
  unitLabel?: string;
}) {
  // Maior faixa primeiro (80-100 no topo) — mais fácil de ler o
  // desempenho de cima para baixo do que do pior para o melhor.
  const chartData: ChartDatum[] = [...data]
    .sort((a, b) => (parseInt(b.range, 10) || 0) - (parseInt(a.range, 10) || 0))
    .map((d) => ({
      ...d,
      label: `${d.count}  (${d.percentage.toFixed(0)}%)`,
    }));

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 8, right: 48 }}
      >
        <XAxis type="number" hide />
        <YAxis
          dataKey="range"
          type="category"
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip content={<ScoreTooltip unitLabel={unitLabel} />} />
        <Bar dataKey="count" radius={[0, 5, 5, 0]} maxBarSize={22}>
          {chartData.map((d) => (
            <Cell key={d.range} fill={colorForRange(d.range)} />
          ))}
          <LabelList
            dataKey="label"
            position="right"
            className="fill-muted-foreground"
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
