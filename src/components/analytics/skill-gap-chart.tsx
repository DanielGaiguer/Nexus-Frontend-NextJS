import type { SkillGapDTO } from "@/types/analytics";

import { DonutChart, type DonutDatum } from "./donut-chart";

// Mesma paleta genérica (CARD_PALETTE) usada no skill-gaps-chart antigo.
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

/**
 * Donut "HardSkills" — skills que aparecem nos projetos/vagas em que o
 * profissional deu match mas que não estão no perfil dele. Não existia
 * como gráfico no Next (só chips de texto); o dashboard antigo sempre
 * mostrou como donut, igual ao SoftSkills.
 */
export function SkillGapChart({ data }: { data: SkillGapDTO[] }) {
  const donutData: DonutDatum[] = data.map((d, i) => ({
    key: d.skillName,
    label: d.skillName,
    value: d.frequency,
    color: PALETTE[i % PALETTE.length],
  }));

  return (
    <DonutChart
      data={donutData}
      unitLabel={(d) =>
        `apareceu ${d.value} ${d.value === 1 ? "vez" : "vezes"}`
      }
    />
  );
}
