import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminSkillsKey } from "@/hooks/queries/useAdminSkills";
import { apiFetch } from "@/lib/api-client";
import type { SkillRequestDTO } from "@/types/admin";

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SkillRequestDTO) =>
      apiFetch<{ message: string }>("/api/admin/skills", {
        method: "POST",
        body,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminSkillsKey() }),
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skillId: number) =>
      apiFetch<{ message: string }>(`/api/admin/skills/${skillId}`, {
        method: "DELETE",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminSkillsKey() }),
  });
}
