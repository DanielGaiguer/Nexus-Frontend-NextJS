import { proxyToBackend } from "@/lib/route-handlers";
import type { PortalSubscriptionChargeDTO } from "@/types/custom-portal";

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
  return proxyToBackend<PortalSubscriptionChargeDTO[]>(
    `/api/admin/portal-subscription-charges${suffix}`
  );
}
