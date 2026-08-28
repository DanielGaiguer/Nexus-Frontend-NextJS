// Só para Server Components / generateMetadata — usa backendFetch (server-side).
import { backendFetch } from "@/lib/api-client";
import type { ProjectResponseDTO } from "@/types/project";
import type { PublicCustomPortalDTO } from "@/types/custom-portal";

/** Server-side: resolve o portal por subdomínio. `null` quando não existe. */
export async function fetchPublicPortal(
  subdomain: string
): Promise<PublicCustomPortalDTO | null> {
  try {
    return await backendFetch<PublicCustomPortalDTO>(
      `/api/public/custom-portal/${encodeURIComponent(subdomain)}`
    );
  } catch {
    return null;
  }
}

/** Server-side: detalhe público de uma oportunidade. `null` quando não existe/fechada. */
export async function fetchPublicOpportunity(
  id: number
): Promise<ProjectResponseDTO | null> {
  try {
    return await backendFetch<ProjectResponseDTO>(
      `/api/public/opportunity/${id}`
    );
  } catch {
    return null;
  }
}

/** Nome de exibição da plataforma (cai pro nome da empresa). */
export function portalTitle(portal: PublicCustomPortalDTO): string {
  return (portal.displayName ?? "").trim() || portal.companyName;
}
