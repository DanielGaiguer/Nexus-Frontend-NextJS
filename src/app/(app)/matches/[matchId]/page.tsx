import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

/**
 * `/matches/{id}` sem sufixo — é pra onde apontam vários `actionUrl` de
 * notificação (`MATCH_CONFIRMED`, `NEW_INVITE`, ...). No app antigo isso
 * sempre cai em `MatchStatusCheckController#redirectBare`, que redireciona
 * incondicionalmente pra `/company/matches` — inclusive quando quem clicou
 * é profissional (aí o AuthInterceptor barra `/company/**` e manda pra `/`,
 * um beco sem saída que era claramente um bug, não intenção). Aqui resolve
 * pelo papel de quem está de fato logado.
 */
export default async function BareMatchRedirectPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(session.role === "COMPANY" ? "/company/matches" : "/pro/matches");
}
