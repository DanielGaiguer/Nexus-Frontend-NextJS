import type { Metadata } from "next";

import { PortalHome } from "@/components/custom-portal/portal-home";
import { fetchPublicPortal, portalTitle } from "@/lib/portal-server";

export async function generateMetadata({
  params,
}: PageProps<"/s/[subdomain]">): Promise<Metadata> {
  const { subdomain } = await params;
  const portal = await fetchPublicPortal(subdomain);

  if (!portal || portal.status !== "ACTIVE") {
    return { title: "Plataforma indisponível" };
  }
  const name = portalTitle(portal);
  return {
    title: `Vagas — ${name}`,
    description:
      (portal.aboutText ?? "").trim().slice(0, 155) ||
      `Oportunidades abertas em ${portal.companyName}.`,
    icons: portal.faviconUrl ? { icon: portal.faviconUrl } : undefined,
  };
}

export default async function PortalHomePage({
  params,
}: PageProps<"/s/[subdomain]">) {
  const { subdomain } = await params;
  return <PortalHome subdomain={subdomain} />;
}
