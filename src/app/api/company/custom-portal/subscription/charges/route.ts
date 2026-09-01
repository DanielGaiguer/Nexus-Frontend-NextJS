import { proxyToBackend } from "@/lib/route-handlers";
import type { PortalSubscriptionChargeDTO } from "@/types/custom-portal";

export async function GET() {
  return proxyToBackend<PortalSubscriptionChargeDTO[]>(
    "/api/company/custom-portal/subscription/charges"
  );
}
