import type { Metadata } from "next";

import { RegisterCompanyForm } from "@/components/auth/register-company-form";

export const metadata: Metadata = { title: "Cadastro Contratante — Nexus" };

export default function RegisterCompanyPage() {
  return <RegisterCompanyForm />;
}
