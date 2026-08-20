import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      // Zera a cache inteira — o próximo login pode ser de outro usuário,
      // não faz sentido reaproveitar nada que ficou em memória.
      queryClient.clear();
    },
  });
}
