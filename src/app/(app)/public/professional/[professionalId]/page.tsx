import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

/**
 * `/public/professional/{id}` no app antigo é a página neutra de perfil,
 * vista tanto pela empresa quanto por qualquer outro papel. No Next, cada
 * papel tem sua própria versão com ações específicas
 * (`/company/professionals/[id]` — revelar contato; `/pro/professional/[id]`
 * — visão entre pares, sem contato; `/admin/professional/[id]` — Prompt 5),
 * então essa rota só existe pra resolver o link neutro (ex.: "voltar ao
 * perfil" a partir da página de avaliações).
 */
export default async function PublicProfessionalRedirectPage({
  params,
}: PageProps<"/public/professional/[professionalId]">) {
  const { professionalId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "COMPANY") {
    redirect(`/company/professionals/${professionalId}`);
  }
  if (session.role === "ADMIN") {
    redirect(`/admin/professional/${professionalId}`);
  }
  redirect(`/pro/professional/${professionalId}`);
}
