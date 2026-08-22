"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

/** Mesmos limiares do `gaugeChart` de admin-dashboard.html (>=85 verde, >=70 âmbar, abaixo vermelho). */
function conversionColor(rate: number) {
  if (rate >= 85) return "var(--nexus-success)";
  if (rate >= 70) return "var(--nexus-warning)";
  return "var(--nexus-danger)";
}

/** Gauge semicircular "Taxa de Conversão" do dashboard do admin — o app
 * antigo nunca usou uma barra de progresso reta aqui, sempre um medidor
 * semicircular (mesma geometria do `ReputationGauge` dos dashboards de
 * empresa/profissional, mas com limiares de cor diferentes). */
export function ConversionRateGauge({ rate }: { rate: number }) {
  const clamped = Math.min(Math.max(rate, 0), 100);
  const color = conversionColor(clamped);

  return (
    <div className="h-32 w-full max-w-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          barSize={14}
          startAngle={200}
          endAngle={-20}
          data={[{ value: clamped }]}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <RadialBar
            dataKey="value"
            cornerRadius={7}
            fill={color}
            background={{ fill: "var(--nexus-primary)", opacity: 0.12 }}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
