"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { SoftSkillFeedbackDTO } from "@/types/analytics";

const chartConfig = {
  count: { label: "Menções", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function SoftSkillFeedbackChart({
  data,
}: {
  data: SoftSkillFeedbackDTO[];
}) {
  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 12, right: 12 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="reason"
          type="category"
          tickLine={false}
          axisLine={false}
          width={140}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
