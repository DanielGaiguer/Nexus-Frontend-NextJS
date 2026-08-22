import type { ProjectStatusDistributionDTO } from "@/types/analytics";

import { DonutChart, type DonutDatum } from "./donut-chart";

// Mesmas cores semânticas de status usadas em company-projects.html /
// company-dashboard.html no app antigo — mais intuitivo que uma paleta
// genérica para esse card.
const STATUS_COLORS: Record<string, string> = {
  OPEN: "var(--nexus-success)",
  PAUSED: "var(--nexus-warning)",
  CLOSED: "var(--nexus-danger)",
};

/** Donut "Status de Vagas" — distribuição dos projetos/vagas da empresa por status. */
export function ProjectStatusChart({
  data,
}: {
  data: ProjectStatusDistributionDTO[];
}) {
  const donutData: DonutDatum[] = data.map((d) => ({
    key: d.enumValue,
    label: d.status,
    value: d.count,
    color: STATUS_COLORS[d.enumValue] ?? "var(--muted-foreground)",
  }));

  return (
    <DonutChart
      data={donutData}
      unitLabel={(d) => `${d.value} ${d.value === 1 ? "projeto" : "projetos"}`}
    />
  );
}
