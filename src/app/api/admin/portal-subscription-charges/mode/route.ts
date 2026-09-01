import { proxyToBackend } from "@/lib/route-handlers";
import type { BillingModeDTO } from "@/types/billing";

export async function GET() {
  return proxyToBackend<BillingModeDTO>(
    "/api/admin/portal-subscription-charges/mode"
  );
}
