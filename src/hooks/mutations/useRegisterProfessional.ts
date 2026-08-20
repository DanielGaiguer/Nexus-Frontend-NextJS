import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { RegisterProfessionalRequestDTO } from "@/types/auth";

export function useRegisterProfessional() {
  return useMutation({
    mutationFn: (request: RegisterProfessionalRequestDTO) =>
      apiFetch<{ message: string }>("/api/auth/register/professional", {
        method: "POST",
        body: request,
      }),
  });
}
