import type { SoftSkillFeedbackDTO } from "@/types/analytics";

import { DonutChart, type DonutDatum } from "./donut-chart";

// Mesma paleta genérica (CARD_PALETTE) usada no soft-skills-chart antigo.
const PALETTE = [
  "#4F7EFF",
  "#00D9C4",
  "#FF6B6B",
  "#FFA500",
  "#9B59B6",
  "#2ECC71",
  "#E74C3C",
  "#3498DB",
];

/** Donut "SoftSkills" — motivos negativos mais citados nas avaliações recebidas. */
export function SoftSkillFeedbackChart({
  data,
}: {
  data: SoftSkillFeedbackDTO[];
}) {
  const donutData: DonutDatum[] = data.map((d, i) => ({
    key: d.enumValue,
    label: d.reason,
    value: d.count,
    color: PALETTE[i % PALETTE.length],
  }));

  return (
    <DonutChart
      data={donutData}
      unitLabel={(d) =>
        `mencionado ${d.value} ${d.value === 1 ? "vez" : "vezes"}`
      }
    />
  );
}
