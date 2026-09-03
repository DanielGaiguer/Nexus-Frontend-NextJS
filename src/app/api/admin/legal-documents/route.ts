import { proxyToBackend } from "@/lib/route-handlers";
import type { AdminLegalOverviewDTO } from "@/types/legal";

// Painel do Admin: versão ativa + histórico de Termos e Política.
export async function GET() {
  return proxyToBackend<AdminLegalOverviewDTO>("/api/admin/legal-documents");
}
