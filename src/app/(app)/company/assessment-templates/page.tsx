import type { Metadata } from "next";

import { AssessmentTemplateLibrary } from "@/components/company/assessment-template-library";

export const metadata: Metadata = { title: "Testes reutilizáveis — Nexus" };

// Biblioteca de testes que não pertencem a uma vaga só. Qualquer membro ACTIVE da conta
// gerencia (o guard de papel vive no backend, em AssessmentTemplateService) -- diferente de
// Membros/Financeiro, que são OWNER-only.
export default function CompanyAssessmentTemplatesPage() {
  return <AssessmentTemplateLibrary />;
}
