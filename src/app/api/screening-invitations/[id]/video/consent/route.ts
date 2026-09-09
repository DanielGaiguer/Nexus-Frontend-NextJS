import { proxyToBackend } from "@/lib/route-handlers";
import type { ScreeningVideoConsentDTO } from "@/types/screening-video";

// Consentimento de gravação DESTA tentativa -- separado do consentimento geral de cadastro
// (UserConsent), porque ceder imagem e voz para um processo seletivo específico é outra
// finalidade. Sem ele o backend recusa assinar qualquer upload.

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/screening-invitations/[id]/video/consent">
) {
  const { id } = await ctx.params;
  return proxyToBackend<ScreeningVideoConsentDTO>(
    `/api/screening-invitations/${id}/video/consent`
  );
}

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/screening-invitations/[id]/video/consent">
) {
  const { id } = await ctx.params;
  return proxyToBackend<ScreeningVideoConsentDTO>(
    `/api/screening-invitations/${id}/video/consent`,
    { method: "POST" }
  );
}
