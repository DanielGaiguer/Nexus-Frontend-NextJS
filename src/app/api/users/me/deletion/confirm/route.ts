import { proxyToBackend } from "@/lib/route-handlers";
import type {
  AccountDeletionConfirmBody,
  AccountDeletionMessage,
} from "@/types/account";

// Confirmação da exclusão (link do e-mail). Pública: o token é a credencial.
export async function POST(request: Request) {
  const body = (await request.json()) as AccountDeletionConfirmBody;
  return proxyToBackend<AccountDeletionMessage>(
    "/api/users/me/deletion/confirm",
    { method: "POST", body, requireAuth: false }
  );
}
