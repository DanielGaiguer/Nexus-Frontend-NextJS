import type { Metadata } from "next";
import { Suspense } from "react";

import { ConfirmAccountDeletion } from "@/components/account/confirm-account-deletion";

export const metadata: Metadata = { title: "Excluir conta — Nexus" };

// Alcançada pelo link do e-mail de confirmação (LGPD). Pública: o token na URL
// é a credencial — ver PUBLIC_PATHS em src/proxy.ts.
export default function AccountDeletePage() {
  return (
    <Suspense fallback={null}>
      <ConfirmAccountDeletion />
    </Suspense>
  );
}
