import type { Metadata } from "next";

import { RegisterProfessionalForm } from "@/components/auth/register-professional-form";

export const metadata: Metadata = { title: "Cadastro Profissional — Nexus" };

export default function RegisterProfessionalPage() {
  return <RegisterProfessionalForm />;
}
