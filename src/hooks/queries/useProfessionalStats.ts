import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProfessionalStatsDTO } from "@/types/professional";

export const professionalStatsKey = () => ["professional", "stats"] as const;

export function useProfessionalStats() {
  return useQuery({
    queryKey: professionalStatsKey(),
    queryFn: () => apiFetch<ProfessionalStatsDTO>("/api/professional/stats"),
  });
}
