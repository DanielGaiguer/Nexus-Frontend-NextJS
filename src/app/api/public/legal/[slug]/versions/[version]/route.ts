import { proxyToBackend } from "@/lib/route-handlers";
import type { LegalDocumentDTO } from "@/types/legal";

// Uma versão específica de um documento legal, com conteúdo. Público.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/public/legal/[slug]/versions/[version]">
) {
  const { slug, version } = await ctx.params;
  return proxyToBackend<LegalDocumentDTO>(
    `/api/public/legal/${encodeURIComponent(slug)}/versions/${encodeURIComponent(version)}`,
    { requireAuth: false }
  );
}
