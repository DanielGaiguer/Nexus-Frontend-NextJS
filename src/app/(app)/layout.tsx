import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ReacceptTermsGate } from "@/components/legal/reaccept-terms-gate";
import { AppShell } from "@/components/shell/app-shell";
import { fetchConsentStatus } from "@/lib/legal-server";
import { getSession } from "@/lib/session";

/**
 * Shell compartilhado por todas as rotas autenticadas (/pro/**, /company/**,
 * /admin/**). Segunda checagem de sessão (defesa em profundidade — src/proxy.ts
 * já barrou quem chegou aqui sem cookie válido) e é aqui que o papel vira
 * navegação: AppShell decide o que a sidebar mostra a partir de session.role.
 *
 * Gate de re-aceite (LGPD): se o backend indica que o usuário não aceitou a
 * versão vigente dos Termos, renderiza a tela de re-aceite NO LUGAR do app —
 * vale para todos os papéis, inclusive ADMIN. É o choke point de 100% das
 * telas autenticadas; o ConsentGateFilter no backend fecha a via de chamada
 * direta à API.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const consent = await fetchConsentStatus();
  if (consent?.mustReacceptTerms) {
    return <ReacceptTermsGate status={consent} />;
  }

  // Estado da sidebar (aberta/recolhida) persiste em cookie (ver
  // src/components/ui/sidebar.tsx) — lido aqui pra o primeiro render do
  // servidor já sair no estado certo, sem flash.
  const sidebarState = (await cookies()).get("sidebar_state")?.value;

  return (
    <AppShell session={session} defaultSidebarOpen={sidebarState !== "false"}>
      {children}
    </AppShell>
  );
}
