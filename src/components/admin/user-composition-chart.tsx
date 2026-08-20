"use client";

import { Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  professionals: { label: "Profissionais", color: "var(--chart-1)" },
  companies: { label: "Empresas", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function UserCompositionChart({
  totalProfessionals,
  totalCompanies,
}: {
  totalProfessionals: number;
  totalCompanies: number;
}) {
  const data = [
    {
      type: "professionals",
      value: totalProfessionals,
      fill: "var(--color-professionals)",
    },
    {
      type: "companies",
      value: totalCompanies,
      fill: "var(--color-companies)",
    },
  ];

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-48">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="type"
          innerRadius={48}
          outerRadius={72}
        />
        <ChartLegend content={<ChartLegendContent nameKey="type" />} />
      </PieChart>
    </ChartContainer>
  );
}
