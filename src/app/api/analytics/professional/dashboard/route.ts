import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalDashboardAnalyticsDTO } from "@/types/analytics";

export async function GET() {
  return proxyToBackend<ProfessionalDashboardAnalyticsDTO>(
    "/api/analytics/professional/dashboard"
  );
}
