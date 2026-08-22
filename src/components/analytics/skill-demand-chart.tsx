import type { SkillDemandDTO } from "@/types/analytics";

import { DonutChart, type DonutDatum } from "./donut-chart";

// Mesmas cores por categoria do skillChart antigo (Backend/Frontend/Mobile/
// DevOps/Database/Data/API) — mantidas fixas para reconhecer visualmente a
// mesma categoria em telas diferentes.
const CATEGORY_COLORS: Record<string, string> = {
  Backend: "var(--nexus-primary)",
  Frontend: "var(--nexus-accent)",
  Mobile: "#f472b6",
  DevOps: "var(--nexus-success)",
  Database: "var(--nexus-warning)",
  Data: "var(--nexus-secondary)",
  API: "#06b6d4",
};
const FALLBACK_PALETTE = [
  "var(--nexus-primary)",
  "var(--nexus-accent)",
  "var(--nexus-success)",
  "var(--nexus-warning)",
  "var(--nexus-secondary)",
  "#f472b6",
  "#06b6d4",
];

/** Donut "Skills Mais Exigidas"/"Minhas Skills Mais Demandadas" — top 8 skills. */
export function SkillDemandChart({ data }: { data: SkillDemandDTO[] }) {
  const top = data.slice(0, 8);
  const donutData: DonutDatum[] = top.map((d, i) => ({
    key: d.skillName,
    label: d.skillName,
    value: d.projectCount,
    color:
      (d.category && CATEGORY_COLORS[d.category]) ||
      FALLBACK_PALETTE[i % FALLBACK_PALETTE.length],
    meta: d.category ?? undefined,
  }));

  return (
    <DonutChart
      data={donutData}
      unitLabel={(d) => `${d.value} projeto(s)`}
      legendMeta={(d) => (d.meta ? `${d.value} · ${d.meta}` : `${d.value}`)}
    />
  );
}
