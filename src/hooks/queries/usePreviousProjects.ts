import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { PreviousProjectDTO } from "@/types/previous-project";

export const previousProjectsKey = () =>
  ["professional", "previous-projects"] as const;

export function usePreviousProjects() {
  return useQuery({
    queryKey: previousProjectsKey(),
    queryFn: () => apiFetch<PreviousProjectDTO[]>("/api/professional/projects"),
  });
}
