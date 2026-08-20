import { proxyToBackend } from "@/lib/route-handlers";
import type { CompanyDashboardDTO } from "@/types/company";

export async function GET() {
  return proxyToBackend<CompanyDashboardDTO>("/api/company/dashboard");
}
