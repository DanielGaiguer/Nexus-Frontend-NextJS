import { proxyToBackend } from "@/lib/route-handlers";
import type { NfseModeDTO } from "@/types/nfse";

export async function GET() {
  return proxyToBackend<NfseModeDTO>("/api/admin/invoices/mode");
}
