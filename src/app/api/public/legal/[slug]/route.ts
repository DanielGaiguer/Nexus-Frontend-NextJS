import { proxyToBackend } from "@/lib/route-handlers";
import type { LegalDocumentDTO } from "@/types/legal";

// Versão ativa de um documento legal (slug = "terms" | "privacy"). Público.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/public/legal/[slug]">
) {
  const { slug } = await ctx.params;
  return proxyToBackend<LegalDocumentDTO>(
    `/api/public/legal/${encodeURIComponent(slug)}`,
    { requireAuth: false }
  );
}
