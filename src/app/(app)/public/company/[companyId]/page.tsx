import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

/**
 * `/public/company/{id}` no app antigo é a página neutra de perfil de
 * empresa. No Next, cada papel tem sua própria versão
 * (`/pro/companies/[id]` — contato, oportunidades fechadas etc.;
 * `/company/companies/[id]` — mesma visão, sem o card de Contato, que não
 * faz sentido entre duas empresas; `/admin/company/[id]` — Prompt 5), então
 * essa rota só resolve o link neutro (ex.: "Ver mais" a partir da página de
 * oportunidade, "voltar ao perfil" a partir da página de avaliações).
 */
export default async function PublicCompanyRedirectPage({
  params,
}: PageProps<"/public/company/[companyId]">) {
  const { companyId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "PROFESSIONAL") {
    redirect(`/pro/companies/${companyId}`);
  }
  if (session.role === "ADMIN") {
    redirect(`/admin/company/${companyId}`);
  }
  redirect(`/company/companies/${companyId}`);
}
