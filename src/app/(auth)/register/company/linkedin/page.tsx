import type { Metadata } from "next";
import { Suspense } from "react";

import { RegisterCompanyLinkedinForm } from "@/components/auth/register-company-linkedin-form";

export const metadata: Metadata = {
  title: "Finalizar Cadastro Empresa — Nexus",
};

// Alcançável hoje só via link direto com ?ticket=...&email=... — o
// redirecionamento automático pós-OAuth do LinkedIn ainda aponta pro
// nexus-frontend antigo (ver README, seção Auth/BFF).
export default function RegisterCompanyLinkedinPage() {
  return (
    <Suspense fallback={null}>
      <RegisterCompanyLinkedinForm />
    </Suspense>
  );
}
