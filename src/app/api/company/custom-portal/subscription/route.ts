import { proxyToBackend } from "@/lib/route-handlers";
import type { PortalSubscriptionStatusDTO } from "@/types/custom-portal";

export async function GET() {
  return proxyToBackend<PortalSubscriptionStatusDTO>(
    "/api/company/custom-portal/subscription"
  );
}
