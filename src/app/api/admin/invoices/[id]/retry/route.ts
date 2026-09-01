import { proxyToBackend } from "@/lib/route-handlers";
import type { NfseInvoiceDTO } from "@/types/nfse";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/admin/invoices/[id]/retry">
) {
  const { id } = await ctx.params;
  return proxyToBackend<NfseInvoiceDTO>(`/api/admin/invoices/${id}/retry`, {
    method: "POST",
  });
}
