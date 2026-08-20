import { useMutation, useQueryClient } from "@tanstack/react-query";

import { professionalProfileKey } from "@/hooks/queries/useProfessionalProfile";
import { apiFetch } from "@/lib/api-client";
import type { ProfessionalProfileDTO } from "@/types/professional";

export function useUpdateProfessionalProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: ProfessionalProfileDTO) =>
      apiFetch<ProfessionalProfileDTO>("/api/professional/profile", {
        method: "PUT",
        body: profile,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(professionalProfileKey(), updated);
    },
  });
}
