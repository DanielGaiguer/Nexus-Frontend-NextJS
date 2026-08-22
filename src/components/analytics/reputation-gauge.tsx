"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

import { thresholdColor } from "./reputation-colors";

/**
 * Gauge semicircular do índice geral de reputação (0-100) — espelha o
 * `echarts.gauge` (`startAngle:200, endAngle:-20`) do card "Reputação
 * Detalhada" no dashboard antigo.
 */
export function ReputationGauge({ score }: { score: number }) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const color = thresholdColor(clamped);

  return (
    <div className="mx-auto w-full max-w-[180px]">
      <div className="h-[110px]">
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
              background={{ fill: "var(--nexus-primary)", opacity: 0.08 }}
              isAnimationActive={false}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="-mt-5 text-center">
        <div
          className="text-2xl leading-none font-bold tabular-nums"
          style={{ color }}
        >
          {clamped.toFixed(0)}
        </div>
        <div className="text-muted-foreground mt-1 text-[11px]">
          Índice de qualidade (0–100)
        </div>
      </div>
    </div>
  );
}
