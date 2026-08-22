import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProjectResponseDTO } from "@/types/project";

export const companyOpportunitiesKey = () =>
  ["company", "opportunities"] as const;

/**
 * Vitrine de todas as oportunidades OPEN da plataforma, do ponto de vista de
 * uma empresa (mercado/concorrência) — espelha company-opportunities.html.
 * Backend já mascara oportunidades com `visibleToCompanies=false`, exceto as
 * da própria empresa logada (ver CompanyController#listAllOpportunities).
 */
export function useCompanyOpportunities() {
  return useQuery({
    queryKey: companyOpportunitiesKey(),
    queryFn: () => apiFetch<ProjectResponseDTO[]>("/api/company/opportunities"),
  });
}
