import { proxyToBackend } from "@/lib/route-handlers";
import type { ConsentStatusDTO } from "@/types/legal";

// Estado de consentimento do usuário logado (usado pelo gate de re-aceite).
export async function GET() {
  return proxyToBackend<ConsentStatusDTO>("/api/legal/consent/status");
}
