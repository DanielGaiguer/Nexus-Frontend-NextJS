import { proxyToBackend } from "@/lib/route-handlers";
import type { AdminCustomPortalAnalyticsDTO } from "@/types/custom-portal";

export async function GET(request: Request) {
  const days = new URL(request.url).searchParams.get("days") ?? "30";
  return proxyToBackend<AdminCustomPortalAnalyticsDTO>(
    `/api/admin/custom-portals/analytics?days=${encodeURIComponent(days)}`
  );
}
