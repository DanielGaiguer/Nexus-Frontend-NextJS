import { proxyToBackend } from "@/lib/route-handlers";
import type { BillingStatusDTO } from "@/types/billing";

export async function POST() {
  return proxyToBackend<BillingStatusDTO>("/api/company/billing/retry-charge", {
    method: "POST",
  });
}
