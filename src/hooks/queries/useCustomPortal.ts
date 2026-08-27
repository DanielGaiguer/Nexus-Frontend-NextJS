import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CustomPortalOverviewDTO } from "@/types/custom-portal";

export const myCustomPortalKey = () => ["company", "custom-portal"] as const;

/** Estado da plataforma personalizada do contratante logado (solicitação + portal). */
export function useMyCustomPortal() {
  return useQuery({
    queryKey: myCustomPortalKey(),
    queryFn: () =>
      apiFetch<CustomPortalOverviewDTO>("/api/company/custom-portal"),
  });
}
