"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

/**
 * Medidor semicircular da taxa de conversão (cliques em "Candidatar-se" /
 * acessos). Mesma geometria do ConversionRateGauge do admin, mas sem limiares
 * verde/vermelho — uma taxa baixa de candidatura é o esperado, não "ruim".
 */
export function PortalConversionGauge({ rate }: { rate: number }) {
  const clamped = Math.min(Math.max(rate, 0), 100);

  return (
    <div className="relative mx-auto h-36 w-full max-w-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          barSize={16}
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
            cornerRadius={8}
            fill="var(--nexus-primary)"
            background={{ fill: "var(--nexus-primary)", opacity: 0.12 }}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-x-0 bottom-3 text-center">
        <div className="text-2xl font-bold tabular-nums">
          {rate.toFixed(1)}%
        </div>
        <div className="text-muted-foreground text-xs">dos acessos</div>
      </div>
    </div>
  );
}
