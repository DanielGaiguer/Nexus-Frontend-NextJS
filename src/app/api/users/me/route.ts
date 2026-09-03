import { proxyToBackend } from "@/lib/route-handlers";
import type { AccountDeletionMessage } from "@/types/account";

// Pedido de exclusão de conta (LGPD). Não anonimiza — o backend manda o
// e-mail de confirmação para o endereço original.
export async function DELETE() {
  return proxyToBackend<AccountDeletionMessage>("/api/users/me", {
    method: "DELETE",
  });
}
