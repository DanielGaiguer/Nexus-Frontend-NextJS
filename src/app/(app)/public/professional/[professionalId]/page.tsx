import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

/**
 * `/public/professional/{id}` no app antigo é a página neutra de perfil,
 * vista tanto pela empresa quanto por qualquer outro papel. No Next, a
 * empresa já tem uma versão própria com ações específicas
 * (`/company/professionals/[id]` — revelar contato, ver skills etc.),
 * então essa rota só existe pra resolver o link neutro (ex.: "voltar ao
 * perfil" a partir da página de avaliações) — redireciona pra lá quando o
 * viewer é COMPANY. Não há um `/pro/professionals/[id]` construído ainda
 * (fora de escopo — pro-professionals.html não fazia parte do Prompt 2
 * original), então PROFESSIONAL/ADMIN cai num 404 esperado por enquanto.
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
    redirect("/admin/dashboard");
  }
  // PROFESSIONAL vendo outro profissional: sem página dedicada ainda.
  redirect("/pro/dashboard");
}
