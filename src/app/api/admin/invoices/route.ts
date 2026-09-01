import { proxyToBackend } from "@/lib/route-handlers";
import type { NfseInvoiceDTO } from "@/types/nfse";

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
  return proxyToBackend<NfseInvoiceDTO[]>(`/api/admin/invoices${suffix}`);
}
