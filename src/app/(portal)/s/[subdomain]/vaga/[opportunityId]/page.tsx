import type { Metadata } from "next";

import { PortalOpportunity } from "@/components/custom-portal/portal-opportunity";
import {
  fetchPublicOpportunity,
  fetchPublicPortal,
  portalTitle,
} from "@/lib/portal-server";

export async function generateMetadata({
  params,
}: PageProps<"/s/[subdomain]/vaga/[opportunityId]">): Promise<Metadata> {
  const { subdomain, opportunityId } = await params;
  const [portal, job] = await Promise.all([
    fetchPublicPortal(subdomain),
    fetchPublicOpportunity(Number(opportunityId)),
  ]);

  if (!portal || portal.status !== "ACTIVE") {
    return { title: "Plataforma indisponível" };
  }
  const name = portalTitle(portal);
  return {
    title: job ? `${job.title} — ${name}` : `Vagas — ${name}`,
    description: job?.description?.trim().slice(0, 155) ?? undefined,
    icons: portal.faviconUrl ? { icon: portal.faviconUrl } : undefined,
  };
}

export default async function PortalOpportunityPage({
  params,
}: PageProps<"/s/[subdomain]/vaga/[opportunityId]">) {
  const { subdomain, opportunityId } = await params;
  return (
    <PortalOpportunity
      subdomain={subdomain}
      opportunityId={Number(opportunityId)}
    />
  );
}
