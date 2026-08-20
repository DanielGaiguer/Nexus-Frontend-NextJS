import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ContactInfoDTO } from "@/types/match";

export const professionalContactKey = (professionalId: number) =>
  ["professional", professionalId, "contact"] as const;

/** Só resolve depois de um match confirmado — backend devolve 403 antes disso. */
export function useProfessionalContact(
  professionalId: number,
  enabled: boolean
) {
  return useQuery({
    queryKey: professionalContactKey(professionalId),
    queryFn: () =>
      apiFetch<ContactInfoDTO>(`/api/professional/${professionalId}/contact`),
    enabled,
  });
}
