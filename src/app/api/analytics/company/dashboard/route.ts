import { proxyToBackend } from "@/lib/route-handlers";
import type { CompanyDashboardAnalyticsDTO } from "@/types/analytics";

export async function GET() {
  return proxyToBackend<CompanyDashboardAnalyticsDTO>(
    "/api/analytics/company/dashboard"
  );
}
