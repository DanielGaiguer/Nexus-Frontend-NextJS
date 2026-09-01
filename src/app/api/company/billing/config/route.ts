import { proxyToBackend } from "@/lib/route-handlers";
import type { BillingConfigDTO } from "@/types/billing";

export async function GET() {
  return proxyToBackend<BillingConfigDTO>("/api/company/billing/config");
}
