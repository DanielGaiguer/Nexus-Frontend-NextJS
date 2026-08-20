import { useMutation, useQueryClient } from "@tanstack/react-query";

import { professionalProfileKey } from "@/hooks/queries/useProfessionalProfile";
import { apiFetch } from "@/lib/api-client";

export function useUpdateProfessionalSkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillIds: number[]) =>
      apiFetch<{ message: string }>("/api/professional/skills", {
        method: "PUT",
        body: skillIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalProfileKey() });
    },
  });
}
