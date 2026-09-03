/**
 * Exclusão de conta (LGPD) — espelha com.main.nexus.dto e os controllers
 * UserAccountController / AccountDeletionService.
 */

/** Corpo do POST /api/users/me/deletion/confirm. */
export interface AccountDeletionConfirmBody {
  token: string;
}

/** Resposta simples { message } de ambos os endpoints. */
export interface AccountDeletionMessage {
  message: string;
}
