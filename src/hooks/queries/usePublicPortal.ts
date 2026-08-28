import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { PublicCustomPortalDTO } from "@/types/custom-portal";

export const publicPortalKey = (subdomain: string) =>
  ["public", "custom-portal", subdomain] as const;

/**
 * Resolve a plataforma personalizada pelo subdomínio para a página pública.
 * `retry: false` — um 404 (subdomínio sem portal) é um estado esperado, não
 * um erro transitório pra repetir.
 */
export function usePublicPortal(subdomain: string) {
  return useQuery({
    queryKey: publicPortalKey(subdomain),
    queryFn: () =>
      apiFetch<PublicCustomPortalDTO>(
        `/api/public/custom-portal/${encodeURIComponent(subdomain)}`
      ),
    retry: false,
    staleTime: 5 * 60_000,
  });
}
