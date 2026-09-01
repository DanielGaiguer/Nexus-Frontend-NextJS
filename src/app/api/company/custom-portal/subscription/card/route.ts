import { proxyToBackend } from "@/lib/route-handlers";
import type { PortalSubscriptionStatusDTO } from "@/types/custom-portal";

export async function POST(request: Request) {
  const body = (await request.json()) as { cardToken: string };
  return proxyToBackend<PortalSubscriptionStatusDTO>(
    "/api/company/custom-portal/subscription/card",
    { method: "POST", body }
  );
}
