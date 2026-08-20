import { useMutation, useQueryClient } from "@tanstack/react-query";

import { professionalProfileKey } from "@/hooks/queries/useProfessionalProfile";
import { apiFetch } from "@/lib/api-client";

export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch<{ url: string }>("/api/professional/profile/photo", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: professionalProfileKey() }),
  });
}

export function useDeleteProfilePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ message: string }>("/api/professional/profile/photo", {
        method: "DELETE",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: professionalProfileKey() }),
  });
}
