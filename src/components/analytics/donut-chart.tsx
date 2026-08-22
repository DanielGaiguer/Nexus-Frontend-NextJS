"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface DonutDatum {
  key: string;
  label: string;
  value: number;
  color: string;
  /** Texto extra opcional (ex.: categoria da skill) usado na legenda/tooltip. */
  meta?: string;
}

function DonutTooltip({
  active,
  payload,
  unitLabel,
}: {
  active?: boolean;
  payload?: { payload: DonutDatum }[];
  unitLabel: (datum: DonutDatum) => string;
}) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  return (
    <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{datum.label}</div>
      <div className="text-muted-foreground">{unitLabel(datum)}</div>
    </div>
  );
}

/**
 * Donut + legenda customizada — espelha o padrão de pie chart (raio
 * 65%-85%, sem rótulos no próprio gráfico, legenda em lista abaixo) usado
 * em quase todos os gráficos categóricos do dashboard antigo (Skills mais
 * exigidas, SoftSkills, HardSkills, Status de vagas).
 */
export function DonutChart({
  data,
  unitLabel,
  legendMeta,
  height = 200,
}: {
  data: DonutDatum[];
  unitLabel: (datum: DonutDatum) => string;
  legendMeta?: (datum: DonutDatum) => string;
  height?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full max-w-70" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip unitLabel={unitLabel} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex max-h-28 w-full flex-col gap-2 overflow-y-auto">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="truncate">{d.label}</span>
            <span className="text-muted-foreground ml-auto shrink-0 text-xs">
              {legendMeta ? legendMeta(d) : unitLabel(d)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
