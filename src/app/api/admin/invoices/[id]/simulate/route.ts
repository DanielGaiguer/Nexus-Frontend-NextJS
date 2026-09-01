import { proxyToBackend } from "@/lib/route-handlers";
import type { NfseInvoiceDTO } from "@/types/nfse";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/invoices/[id]/simulate">
) {
  const { id } = await ctx.params;
  const body = (await request.json()) as { outcome: "authorized" | "denied" };
  return proxyToBackend<NfseInvoiceDTO>(`/api/admin/invoices/${id}/simulate`, {
    method: "POST",
    body,
  });
}
