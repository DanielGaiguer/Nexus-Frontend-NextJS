import { proxyToBackend } from "@/lib/route-handlers";
import type { ConsentStatusDTO, ReacceptConsentBody } from "@/types/legal";

// Re-aceite dos Termos (tela obrigatória após nova versão). O backend
// re-valida e carimba a versão sozinho.
export async function POST(request: Request) {
  const body = (await request.json()) as ReacceptConsentBody;
  return proxyToBackend<ConsentStatusDTO>("/api/legal/consent/reaccept", {
    method: "POST",
    body,
  });
}
