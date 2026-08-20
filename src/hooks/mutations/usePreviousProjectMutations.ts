import { useMutation, useQueryClient } from "@tanstack/react-query";

import { previousProjectsKey } from "@/hooks/queries/usePreviousProjects";
import { apiFetch } from "@/lib/api-client";
import type { PreviousProjectDTO } from "@/types/previous-project";

type PreviousProjectInput = Omit<PreviousProjectDTO, "id">;

export function useAddPreviousProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (project: PreviousProjectInput) =>
      apiFetch<{ message: string }>("/api/professional/projects", {
        method: "POST",
        body: project,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: previousProjectsKey() }),
  });
}

export function useUpdatePreviousProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...project }: PreviousProjectDTO) =>
      apiFetch<{ message: string }>(`/api/professional/projects/${id}`, {
        method: "PUT",
        body: { id, ...project },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: previousProjectsKey() }),
  });
}

export function useDeletePreviousProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ message: string }>(`/api/professional/projects/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: previousProjectsKey() }),
  });
}
