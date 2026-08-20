import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

/**
 * `/public/company/{id}` no app antigo é a página neutra de perfil de
 * empresa. No Next, o profissional já tem sua própria versão
 * (`/pro/companies/[id]` — contato, oportunidades fechadas etc.), então
 * essa rota só resolve o link neutro (ex.: "voltar ao perfil" a partir da
 * página de avaliações) — redireciona pra lá quando o viewer é
 * PROFESSIONAL, ou pro `/admin/company/[id]` (Prompt 5) quando é ADMIN.
 * Não há `/company/companies/[id]` (o diretório de empresas é só
 * listagem, sem detalhe — ver README, Prompt 3), então COMPANY cai de
 * volta no diretório.
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
  redirect("/company/companies");
}
