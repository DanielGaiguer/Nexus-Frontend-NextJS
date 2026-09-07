import type { Metadata } from "next";
import { Suspense } from "react";

import { JoinInvitation } from "@/components/auth/join-invitation";

export const metadata: Metadata = { title: "Aceitar convite — Nexus" };

// Alcançada pelo link do e-mail de convite de membro. Pública: o token na URL é
// a credencial e a conta ainda nem existe — ver PUBLIC_PATHS em src/proxy.ts e
// o permitAll no SecurityConfig do backend.
export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinInvitation />
    </Suspense>
  );
}
