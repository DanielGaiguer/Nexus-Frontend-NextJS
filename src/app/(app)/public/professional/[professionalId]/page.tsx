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
  searchParams,
}: PageProps<"/public/professional/[professionalId]">) {
  const { professionalId } = await params;
  const query = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "COMPANY") {
    // `matchId`/`returnTo` vêm da tela de comparação (ver "Ver perfil" em
    // company/projects/[projectId]/compare) e habilitam o botão "Demonstrar
    // interesse" na página do profissional, com volta pra comparação.
    const forwarded = new URLSearchParams();
    if (typeof query.matchId === "string")
      forwarded.set("matchId", query.matchId);
    if (typeof query.returnTo === "string")
      forwarded.set("returnTo", query.returnTo);
    const suffix = forwarded.size > 0 ? `?${forwarded.toString()}` : "";
    redirect(`/company/professionals/${professionalId}${suffix}`);
  }
  if (session.role === "ADMIN") {
    redirect(`/admin/professional/${professionalId}`);
  }
  redirect(`/pro/professional/${professionalId}`);
}
