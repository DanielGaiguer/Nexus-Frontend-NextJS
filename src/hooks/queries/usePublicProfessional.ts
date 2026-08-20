import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { PublicProfessionalDTO } from "@/types/public";

export const publicProfessionalKey = (id: number) =>
  ["public", "professional", id] as const;

export function usePublicProfessional(id: number | undefined) {
  return useQuery({
    queryKey: publicProfessionalKey(id ?? 0),
    queryFn: () =>
      apiFetch<PublicProfessionalDTO>(`/api/public/professional/${id}`),
    enabled: id != null,
  });
}
