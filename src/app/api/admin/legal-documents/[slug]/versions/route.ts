import { proxyToBackend } from "@/lib/route-handlers";
import type { LegalDocumentDTO, PublishLegalDocumentBody } from "@/types/legal";

// Admin publica uma nova versão de Termos ou Política. Publicar Termos leva
// todo usuário com aceite de versão anterior à tela de re-aceite obrigatório.
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/legal-documents/[slug]/versions">
) {
  const { slug } = await ctx.params;
  const body = (await request.json()) as PublishLegalDocumentBody;
  return proxyToBackend<LegalDocumentDTO>(
    `/api/admin/legal-documents/${encodeURIComponent(slug)}/versions`,
    { method: "POST", body }
  );
}
