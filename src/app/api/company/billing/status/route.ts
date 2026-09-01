import { proxyToBackend } from "@/lib/route-handlers";
import type { BillingStatusDTO } from "@/types/billing";

export async function GET() {
  return proxyToBackend<BillingStatusDTO>("/api/company/billing/status");
}
