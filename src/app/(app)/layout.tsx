import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { getSession } from "@/lib/session";

/**
 * Shell compartilhado por todas as rotas autenticadas (/pro/**, /company/**,
 * /admin/**). Segunda checagem de sessão (defesa em profundidade — src/proxy.ts
 * já barrou quem chegou aqui sem cookie válido) e é aqui que o papel vira
 * navegação: AppShell decide o que a sidebar mostra a partir de session.role.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
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
