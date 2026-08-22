"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

import { thresholdColor } from "./reputation-colors";

export interface AcceptanceRateDatum {
  key: string;
  label: string;
  acceptanceRate: number;
  confirmedMatches: number;
  rejectedMatches: number;
}

const chartConfig = {
  acceptanceRate: { label: "Taxa de Aceitação", color: "var(--nexus-primary)" },
} satisfies ChartConfig;

function truncate(label: string, max = 16) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

function AcceptanceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: AcceptanceRateDatum & { displayLabel: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="border-border/50 bg-background grid gap-1 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{d.label}</div>
      <div className="text-success">Confirmados: {d.confirmedMatches}</div>
      <div className="text-destructive">Rejeitados: {d.rejectedMatches}</div>
      <div className="text-muted-foreground">
        Taxa: {d.acceptanceRate.toFixed(1)}%
      </div>
    </div>
  );
}

/**
 * Barras de taxa de aceitação por oportunidade (projeto/vaga) ou por
 * empresa — espelha `projectChart`/`companyChart` do dashboard antigo:
 * uma barra por entidade, altura = taxa de aceitação (0-100%), cor pelo
 * mesmo limiar usado no gauge de reputação.
 */
export function AcceptanceRateChart({ data }: { data: AcceptanceRateDatum[] }) {
  const chartData = data.map((d) => ({
    ...d,
    displayLabel: truncate(d.label),
  }));
  const rotate = chartData.length > 3;

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart
        data={chartData}
        margin={{ left: 12, right: 12, bottom: rotate ? 16 : 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="displayLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          angle={rotate ? -20 : 0}
          textAnchor={rotate ? "end" : "middle"}
          height={rotate ? 46 : 24}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip content={<AcceptanceTooltip />} />
        <Bar dataKey="acceptanceRate" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {chartData.map((d) => (
            <Cell key={d.key} fill={thresholdColor(d.acceptanceRate)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
