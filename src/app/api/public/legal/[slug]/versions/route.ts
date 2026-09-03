import { proxyToBackend } from "@/lib/route-handlers";
import type { LegalDocumentVersionDTO } from "@/types/legal";

// Histórico de versões de um documento legal (sem conteúdo). Público.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/public/legal/[slug]/versions">
) {
  const { slug } = await ctx.params;
  return proxyToBackend<LegalDocumentVersionDTO[]>(
    `/api/public/legal/${encodeURIComponent(slug)}/versions`,
    { requireAuth: false }
  );
}
