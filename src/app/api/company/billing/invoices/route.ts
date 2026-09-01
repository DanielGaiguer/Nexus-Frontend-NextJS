import { proxyToBackend } from "@/lib/route-handlers";
import type { NfseInvoiceDTO } from "@/types/nfse";

export async function GET() {
  return proxyToBackend<NfseInvoiceDTO[]>("/api/company/billing/invoices");
}
