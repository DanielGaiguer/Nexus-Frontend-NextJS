import { redirect } from "next/navigation";

import { OpportunityDetailContent } from "@/components/public/opportunity-detail-content";
import { getSession } from "@/lib/session";

/**
 * `/public/opportunity/{id}` no app antigo é servido fora do shell
 * autenticado (layout de marketing, sem exigir login). Este projeto ainda
 * não tem um site público — todo mundo entra pelo /login primeiro — então,
 * diferente de /public/professional e /public/company (que já tinham
 * equivalente autenticado por papel), esta é uma tela genuinamente nova,
 * só que hospedada dentro do shell autenticado por consistência com o
 * resto do port. Simplificação registrada no README.
 */
export default async function PublicOpportunityPage({
  params,
}: PageProps<"/public/opportunity/[opportunityId]">) {
  const { opportunityId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <OpportunityDetailContent
      opportunityId={Number(opportunityId)}
      viewerRole={session.role}
    />
  );
}
