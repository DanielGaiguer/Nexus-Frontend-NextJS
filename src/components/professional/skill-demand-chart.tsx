"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { SkillDemandDTO } from "@/types/analytics";

const chartConfig = {
  projectCount: { label: "Oportunidades", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function SkillDemandChart({ data }: { data: SkillDemandDTO[] }) {
  const top = data.slice(0, 8);
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={top} layout="vertical" margin={{ left: 12, right: 12 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="skillName"
          type="category"
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="projectCount"
          fill="var(--color-projectCount)"
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  );
}
