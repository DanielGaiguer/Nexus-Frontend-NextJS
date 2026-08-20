/**
 * Porte 1:1 de nexus-frontend/static/js/nexus-score-simulator.js — uma
 * ESTIMATIVA client-side (pesos fixos, não é a fórmula real de matching do
 * backend) usada só como feedback instantâneo enquanto o profissional edita
 * o perfil. O score de verdade é calculado pelo Spring por vaga
 * (ScoreBreakdownDTO); isto aqui nunca é enviado pra API.
 */

export interface ScoreSimulatorInput {
  skillsCount: number;
  minSalary: number;
  maxSalary: number;
  /** Quantidade de projetos no portfólio. */
  historyCount: number;
  /** 0–5. */
  reputation: number;
  available: boolean;
  avgProjectBudget?: number;
}

export interface ScoreSimulatorBreakdown {
  label: string;
  weight: number;
  value: number;
}

export interface ScoreSimulatorResult {
  score: number;
  breakdown: ScoreSimulatorBreakdown[];
}

function calcSkillScore(numSkills: number): number {
  if (numSkills === 0) return 0;
  const assumed = 4;
  return Math.min((numSkills / assumed) * 100, 100);
}

function calcBudgetScore(
  minSalary: number,
  maxSalary: number,
  avgBudget: number
): number {
  if (!minSalary || !maxSalary || !avgBudget) return 50;
  const avgPret = (minSalary + maxSalary) / 2;
  if (avgPret <= avgBudget) {
    const ratio = avgPret / avgBudget;
    return Math.min(100, 80 + ratio * 20);
  }
  const excess = (avgPret - avgBudget) / avgBudget;
  return Math.max(0, 100 - excess * 100);
}

function calcHistoryScore(numProjects: number): number {
  return Math.min(numProjects * 10, 100);
}

function calcReputationScore(reputation: number): number {
  if (!reputation) return 50;
  return (reputation / 5.0) * 100;
}

function calcAvailabilityScore(available: boolean): number {
  return available ? 100 : 0;
}

export function simulateScore(
  input: ScoreSimulatorInput
): ScoreSimulatorResult {
  const avgBudget = input.avgProjectBudget ?? 10000;

  const sSkill = calcSkillScore(input.skillsCount);
  const sBudget = calcBudgetScore(input.minSalary, input.maxSalary, avgBudget);
  const sHistory = calcHistoryScore(input.historyCount);
  const sReputation = calcReputationScore(input.reputation);
  const sAvailability = calcAvailabilityScore(input.available);

  const weighted =
    sSkill * 0.35 +
    sBudget * 0.25 +
    sHistory * 0.2 +
    sReputation * 0.1 +
    sAvailability * 0.1;
  const score = Math.round(Math.min(Math.max(weighted, 0), 100));

  return {
    score,
    breakdown: [
      { label: "Skills", weight: 0.35, value: Math.round(sSkill) },
      { label: "Orçamento", weight: 0.25, value: Math.round(sBudget) },
      { label: "Histórico", weight: 0.2, value: Math.round(sHistory) },
      { label: "Reputação", weight: 0.1, value: Math.round(sReputation) },
      {
        label: "Disponibilidade",
        weight: 0.1,
        value: Math.round(sAvailability),
      },
    ],
  };
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Bom";
  if (score >= 50) return "Regular";
  return "Baixo";
}
