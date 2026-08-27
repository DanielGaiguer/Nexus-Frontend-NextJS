import { useQuery, useQueryClient } from "@tanstack/react-query";

import { companyDashboardSummaryKey } from "@/hooks/queries/useCompanyDashboardSummary";
import {
  confirmedCompanyMatchesKey,
  previousCompanyMatchesKey,
} from "@/hooks/queries/useCompanyMatches";
import { companyProfileKey } from "@/hooks/queries/useCompanyProfile";
import { myProjectsKey } from "@/hooks/queries/useMyProjects";
import {
  pendingReviewKey,
  pendingStatusCheckKey,
} from "@/hooks/queries/useReviews";
import { apiFetch } from "@/lib/api-client";
import type { CompanyDashboardBundleDTO } from "@/types/company";

export const companyDashboardBundleKey = () =>
  ["company", "dashboard", "bundle"] as const;

/**
 * Uma única query pra tudo que `/company/dashboard` precisa. O Route Handler
 * (`/api/company/dashboard/bundle`) faz o fan-out server-side em paralelo;
 * aqui a gente semeia o cache de cada query individual com o pedaço
 * correspondente, pra que os hooks já existentes (`useCompanyProfile`,
 * `useMyProjects`, `usePendingStatusCheck`, ...) usados no header/sidebar,
 * nos diálogos do próprio dashboard e em outras telas reaproveitem o dado
 * sem refetch (dentro do `staleTime` padrão de 30s).
 */
export function useCompanyDashboardBundle() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: companyDashboardBundleKey(),
    queryFn: async () => {
      const bundle = await apiFetch<CompanyDashboardBundleDTO>(
        "/api/company/dashboard/bundle"
      );

      queryClient.setQueryData(companyProfileKey(), bundle.profile);
      queryClient.setQueryData(companyDashboardSummaryKey(), bundle.summary);
      queryClient.setQueryData(myProjectsKey(), bundle.projects);
      queryClient.setQueryData(
        confirmedCompanyMatchesKey(),
        bundle.confirmedMatches
      );
      queryClient.setQueryData(
        previousCompanyMatchesKey(),
        bundle.previousMatches
      );
      queryClient.setQueryData(
        pendingStatusCheckKey(),
        bundle.pendingStatusCheck
      );
      queryClient.setQueryData(
        pendingReviewKey("company"),
        bundle.pendingReview
      );

      return bundle;
    },
  });
}
