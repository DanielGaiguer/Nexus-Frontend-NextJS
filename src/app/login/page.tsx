import { Suspense } from "react";

import { LoginMechanicsForm } from "./login-mechanics-form";

/**
 * Placeholder — a tela real (mesmos campos do antigo login.html, em
 * componentes shadcn Form/Input/Card, com validação e toasts) chega no
 * Prompt 1. Isto aqui só exercita a mecânica do BFF (POST /api/auth/login,
 * cookie httpOnly, redirecionamento) descrita no Prompt 0.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="w-full max-w-sm space-y-1 text-center">
        <h1 className="text-xl font-semibold">Entrar</h1>
        <p className="text-muted-foreground text-sm">
          Mecânica de auth do Prompt 0 — UI definitiva no Prompt 1.
        </p>
      </div>
      <Suspense fallback={null}>
        <LoginMechanicsForm />
      </Suspense>
    </div>
  );
}
