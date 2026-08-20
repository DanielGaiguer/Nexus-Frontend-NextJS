import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { RegisterCompanyRequestDTO } from "@/types/auth";

export function useRegisterCompany() {
  return useMutation({
    mutationFn: (request: RegisterCompanyRequestDTO) =>
      apiFetch<{ message: string }>("/api/auth/register/company", {
        method: "POST",
        body: request,
      }),
  });
}
