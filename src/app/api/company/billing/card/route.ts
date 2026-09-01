import { proxyToBackend } from "@/lib/route-handlers";
import type { BillingStatusDTO, SaveCardBody } from "@/types/billing";

export async function POST(request: Request) {
  const body = (await request.json()) as SaveCardBody;
  return proxyToBackend<BillingStatusDTO>("/api/company/billing/card", {
    method: "POST",
    body,
  });
}

export async function DELETE() {
  return proxyToBackend<BillingStatusDTO>("/api/company/billing/card", {
    method: "DELETE",
  });
}
