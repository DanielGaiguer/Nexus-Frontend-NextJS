import { useMutation, useQueryClient } from "@tanstack/react-query";

import { companyProfileKey } from "@/hooks/queries/useCompanyProfile";
import { apiFetch } from "@/lib/api-client";
import type { CompanyProfileDTO } from "@/types/company";

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: CompanyProfileDTO) =>
      apiFetch<CompanyProfileDTO>("/api/company/profile", {
        method: "PUT",
        body: profile,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(companyProfileKey(), updated);
    },
  });
}
