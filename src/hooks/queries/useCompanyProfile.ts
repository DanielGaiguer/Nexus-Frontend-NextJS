import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CompanyProfileDTO } from "@/types/company";

export const companyProfileKey = () => ["company", "profile"] as const;

/** Perfil da empresa autenticada — usado no header/sidebar e no dashboard. */
export function useCompanyProfile(enabled = true) {
  return useQuery({
    queryKey: companyProfileKey(),
    queryFn: () => apiFetch<CompanyProfileDTO>("/api/company/profile"),
    enabled,
    // Mesma razão de useProfessionalProfile: dado estável na sessão, header e
    // sidebar sempre montados; a edição de perfil invalida esta chave.
    staleTime: 5 * 60 * 1000,
  });
}
