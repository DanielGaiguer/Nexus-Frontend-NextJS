import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ContactInfoDTO } from "@/types/match";

export const companyContactKey = (companyId: number) =>
  ["company", companyId, "contact"] as const;

/** Só resolve depois de um match confirmado — backend devolve 403 antes disso. */
export function useCompanyContact(companyId: number, enabled: boolean) {
  return useQuery({
    queryKey: companyContactKey(companyId),
    queryFn: () =>
      apiFetch<ContactInfoDTO>(`/api/company/${companyId}/contact`),
    enabled,
  });
}
