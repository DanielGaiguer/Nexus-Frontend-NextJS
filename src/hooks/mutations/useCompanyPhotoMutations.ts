import { useMutation, useQueryClient } from "@tanstack/react-query";

import { companyProfileKey } from "@/hooks/queries/useCompanyProfile";
import { apiFetch } from "@/lib/api-client";

export function useUploadCompanyPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch<{ url: string }>("/api/company/profile/photo", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: companyProfileKey() }),
  });
}

export function useDeleteCompanyPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ message: string }>("/api/company/profile/photo", {
        method: "DELETE",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: companyProfileKey() }),
  });
}
