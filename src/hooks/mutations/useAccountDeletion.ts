import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  AccountDeletionConfirmBody,
  AccountDeletionMessage,
} from "@/types/account";

// Pedido de exclusão (rota autenticada) — dispara o e-mail de confirmação.
export function useRequestAccountDeletion() {
  return useMutation({
    mutationFn: () =>
      apiFetch<AccountDeletionMessage>("/api/users/me", { method: "DELETE" }),
  });
}

// Confirmação via token do e-mail. Ao concluir, limpa a sessão local (o cookie
// httpOnly) e a cache — a conta não existe mais como identidade utilizável.
export function useConfirmAccountDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AccountDeletionConfirmBody) =>
      apiFetch<AccountDeletionMessage>("/api/users/me/deletion/confirm", {
        method: "POST",
        body,
      }),
    onSuccess: async () => {
      try {
        await apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
      } catch {
        // sem sessão local (link aberto deslogado) — nada a limpar
      }
      queryClient.clear();
    },
  });
}
