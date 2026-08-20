import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { RegisterCompanyLinkedInRequestDTO } from "@/types/auth";

export function useRegisterCompanyLinkedin() {
  return useMutation({
    mutationFn: (request: RegisterCompanyLinkedInRequestDTO) =>
      apiFetch<{ message: string }>("/api/auth/register/company/linkedin", {
        method: "POST",
        body: request,
      }),
  });
}
