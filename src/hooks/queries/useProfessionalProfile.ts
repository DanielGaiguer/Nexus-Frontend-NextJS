import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProfessionalProfileDTO } from "@/types/professional";

export const professionalProfileKey = () =>
  ["professional", "profile"] as const;

/** Perfil do profissional autenticado — usado no header/sidebar e no dashboard. */
export function useProfessionalProfile(enabled = true) {
  return useQuery({
    queryKey: professionalProfileKey(),
    queryFn: () =>
      apiFetch<ProfessionalProfileDTO>("/api/professional/profile"),
    enabled,
  });
}
