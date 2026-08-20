import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

/**
 * Placeholder — o dashboard real (Prompt 1) busca dados de
 * ProfessionalDashboardDTO/CompanyDashboardDTO via TanStack Query, com
 * skeleton de carregamento. Esta página só prova que a rota está protegida
 * (o proxy já barrou quem chegou aqui sem cookie válido) e que dá pra ler a
 * sessão num Server Component.
 */
export default async function DashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // Segunda checagem (defesa em profundidade) — o proxy já deveria ter
  // redirecionado antes de chegar aqui.
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Rota protegida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Sessão válida — cookie httpOnly verificado pelo proxy e de novo aqui
            no server component.
          </p>
          <dl className="text-sm">
            <div className="flex justify-between border-b py-1.5">
              <dt className="text-muted-foreground">E-mail</dt>
              <dd>{session.email}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Papel</dt>
              <dd>{session.role}</dd>
            </div>
          </dl>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
