import { useMutation, useQueryClient } from "@tanstack/react-query";

import { professionalProfileKey } from "@/hooks/queries/useProfessionalProfile";
import { apiFetch } from "@/lib/api-client";

export function useUploadResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch<{ message: string }>("/api/professional/resume", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: professionalProfileKey() }),
  });
}
