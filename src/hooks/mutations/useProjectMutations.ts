import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myProjectsKey, projectKey } from "@/hooks/queries/useMyProjects";
import { apiFetch } from "@/lib/api-client";
import type { ProjectRequestDTO, ProjectResponseDTO } from "@/types/project";

function useInvalidateProjects() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: myProjectsKey() });
}

export function useCreateProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (project: ProjectRequestDTO) =>
      apiFetch<ProjectResponseDTO>("/api/projects", {
        method: "POST",
        body: project,
      }),
    onSuccess: invalidate,
  });
}

export function useUpdateProject() {
  const invalidate = useInvalidateProjects();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...project }: ProjectRequestDTO & { id: number }) =>
      apiFetch<ProjectResponseDTO>(`/api/projects/${id}`, {
        method: "PUT",
        body: project,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(projectKey(updated.id), updated);
      invalidate();
    },
  });
}

export function useDeleteProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ message: string }>(`/api/projects/${id}`, {
        method: "DELETE",
      }),
    onSuccess: invalidate,
  });
}

export function useCloseProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ message: string }>(`/api/projects/${id}/close`, {
        method: "PUT",
      }),
    onSuccess: invalidate,
  });
}

export function useReopenProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({ id, maxPositions }: { id: number; maxPositions?: number }) =>
      apiFetch<ProjectResponseDTO>(
        `/api/projects/${id}/reopen${maxPositions != null ? `?maxPositions=${maxPositions}` : ""}`,
        { method: "PUT" }
      ),
    onSuccess: invalidate,
  });
}

export function useResumeProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({
      id,
      additionalPositions,
    }: {
      id: number;
      additionalPositions: number;
    }) =>
      apiFetch<ProjectResponseDTO>(
        `/api/projects/${id}/resume?additionalPositions=${additionalPositions}`,
        { method: "PUT" }
      ),
    onSuccess: invalidate,
  });
}
