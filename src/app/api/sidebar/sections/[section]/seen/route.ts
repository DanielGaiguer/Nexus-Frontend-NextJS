import { proxyToBackend } from "@/lib/route-handlers";

/**
 * Marca uma seção do "Padrão B" (PRO_MATCHES, PRO_PROPOSALS,
 * COMPANY_CUSTOM_PORTAL) como vista -- zera o badge dela. Chamado quando o
 * usuário abre a página da seção.
 */
export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/sidebar/sections/[section]/seen">
) {
  const { section } = await ctx.params;
  return proxyToBackend<void>(`/api/sidebar/sections/${section}/seen`, {
    method: "POST",
  });
}
