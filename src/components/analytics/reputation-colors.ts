/**
 * Mesmos limiares de cor do dashboard antigo (função `valueColor` nos
 * scripts inline de company-analytics.html / pro-analytics.html) — usado
 * tanto no gauge de reputação quanto nas barras de taxa de aceitação, que
 * lá também compartilhavam essa mesma função.
 */
export function thresholdColor(score: number): string {
  if (score >= 80) return "var(--nexus-success)";
  if (score >= 60) return "var(--nexus-primary)";
  if (score >= 40) return "var(--nexus-warning)";
  return "var(--nexus-danger)";
}
