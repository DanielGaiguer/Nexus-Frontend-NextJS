import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import {
  useConfirmedCompanyMatches,
  usePreviousCompanyMatches,
} from "@/hooks/queries/useCompanyMatches";
import type { CompanyDashboardDTO } from "@/types/company";

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
export function useCompanySuccessRate() {
  const dashboard = useCompanyDashboardSummary();
  const confirmedMatches = useConfirmedCompanyMatches();
  const previousMatches = usePreviousCompanyMatches();

  const projectsWithMatch = new Set([
    ...(confirmedMatches.data ?? []).map((m) => m.project.id),
    ...(previousMatches.data ?? []).map((m) => m.project.id),
  ]);

  const value =
    dashboard.data && dashboard.data.totalProjects > 0
      ? `${Math.round(
          (projectsWithMatch.size / dashboard.data.totalProjects) * 100
        )}%`
      : "—";

  return {
    value,
    isLoading:
      dashboard.isLoading ||
      confirmedMatches.isLoading ||
      previousMatches.isLoading,
  };
}
