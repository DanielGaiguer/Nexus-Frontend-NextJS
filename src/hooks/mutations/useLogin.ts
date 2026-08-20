import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { LoginRequestDTO, SessionSummary } from "@/types/auth";

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginRequestDTO) =>
      apiFetch<SessionSummary>("/api/auth/login", {
        method: "POST",
        body: credentials,
      }),
  });
}
