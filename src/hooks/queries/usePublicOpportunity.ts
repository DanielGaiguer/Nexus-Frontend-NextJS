import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProjectResponseDTO } from "@/types/project";

export const publicOpportunityKey = (id: number) =>
  ["public", "opportunity", id] as const;

export function usePublicOpportunity(id: number | undefined) {
  return useQuery({
    queryKey: publicOpportunityKey(id ?? 0),
    queryFn: () =>
      apiFetch<ProjectResponseDTO>(`/api/public/opportunity/${id}`),
    enabled: id != null,
  });
}
