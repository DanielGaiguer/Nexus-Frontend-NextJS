import { proxyToBackend } from "@/lib/route-handlers";
import type { CustomPortalAnalyticsDTO } from "@/types/custom-portal";

export async function GET(request: Request) {
  const days = new URL(request.url).searchParams.get("days") ?? "30";
  return proxyToBackend<CustomPortalAnalyticsDTO>(
    `/api/company/custom-portal/analytics?days=${encodeURIComponent(days)}`
  );
}
