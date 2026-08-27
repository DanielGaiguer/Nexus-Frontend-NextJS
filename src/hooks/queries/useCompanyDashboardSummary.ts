import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import {
  useConfirmedCompanyMatches,
  usePreviousCompanyMatches,
} from "@/hooks/queries/useCompanyMatches";
import type { CompanyDashboardDTO } from "@/types/company";
import type { MatchResponseDTO } from "@/types/match";

export const companyDashboardSummaryKey = () =>
  ["company", "dashboard", "summary"] as const;

/** /api/company/dashboard — totais simples (CompanyDashboardDTO), diferente do dashboard analítico (useCompanyDashboard). */
export function useCompanyDashboardSummary() {
  return useQuery({
    queryKey: companyDashboardSummaryKey(),
    queryFn: () => apiFetch<CompanyDashboardDTO>("/api/company/dashboard"),
  });
}

/**
 * "Taxa de sucesso" única e oficial da empresa — % dos projetos que já
 * tiveram pelo menos 1 match confirmado (ativo ou já encerrado). Fonte
 * única de verdade usada tanto em company/dashboard quanto em
 * company/profile: antes cada tela calculava esse número do seu próprio
 * jeito (dashboard usava filledPositions do projeto, perfil usava matches
 * confirmados) e podiam divergir pra mesma empresa. Nunca passa de 100%,
 * diferente de matches÷projetos (um projeto pode ter vários matches
 * confirmados, uma posição por match).
 */
/**
 * Cálculo puro da taxa de sucesso — extraído pra `company/dashboard` poder
 * derivá-la do payload agregado (`useCompanyDashboardBundle`) usando
 * exatamente a mesma fórmula que `useCompanySuccessRate` usa em
 * `company/profile`, sem os dois divergirem.
 */
export function computeSuccessRate(
  totalProjects: number | undefined,
  confirmedMatches: MatchResponseDTO[] | undefined,
  previousMatches: MatchResponseDTO[] | undefined
): string {
  if (totalProjects === undefined || totalProjects <= 0) return "—";

  const projectsWithMatch = new Set([
    ...(confirmedMatches ?? []).map((m) => m.project.id),
    ...(previousMatches ?? []).map((m) => m.project.id),
  ]);

  return `${Math.round((projectsWithMatch.size / totalProjects) * 100)}%`;
}

export function useCompanySuccessRate() {
  const dashboard = useCompanyDashboardSummary();
  const confirmedMatches = useConfirmedCompanyMatches();
  const previousMatches = usePreviousCompanyMatches();

  return {
    value: computeSuccessRate(
      dashboard.data?.totalProjects,
      confirmedMatches.data,
      previousMatches.data
    ),
    isLoading:
      dashboard.isLoading ||
      confirmedMatches.isLoading ||
      previousMatches.isLoading,
  };
}
