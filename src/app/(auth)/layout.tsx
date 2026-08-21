import { HomeNav } from "@/components/marketing/home-nav";
import { getSession } from "@/lib/session";

// As rotas deste grupo (login/cadastro) estão em AUTH_ONLY_PATHS no
// proxy.ts: uma sessão válida é sempre redirecionada pro dashboard do
// papel antes de chegar aqui, então `session` na prática é sempre null —
// buscamos mesmo assim por robustez em vez de fixar `null` na mão.
//
// Reaproveita o mesmo header da home (logo, links Como funciona/Para
// empresas/Para profissionais, Entrar/Criar conta) em vez do header
// genérico do app antigo (fragments/header.html), cujos links de âncora
// (#how-it-works, #matching-engine) já estavam quebrados no nexus-frontend
// original — a home foi redesenhada e não tem mais esses ids. Decisão
// registrada no Prompt de auditoria de fidelidade.
export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <HomeNav session={session} />
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md sm:max-w-lg">{children}</div>
      </main>
    </div>
  );
}
