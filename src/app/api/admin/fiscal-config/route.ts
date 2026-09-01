import { proxyToBackend } from "@/lib/route-handlers";
import type { FiscalConfigDTO, UpdateFiscalConfigBody } from "@/types/nfse";

export async function GET() {
  return proxyToBackend<FiscalConfigDTO>("/api/admin/fiscal-config");
}

export async function PUT(request: Request) {
  const body = (await request.json()) as UpdateFiscalConfigBody;
  return proxyToBackend<FiscalConfigDTO>("/api/admin/fiscal-config", {
    method: "PUT",
    body,
  });
}
