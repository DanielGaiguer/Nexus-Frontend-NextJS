import { proxyToBackend } from "@/lib/route-handlers";
import type { CustomPortalOverviewDTO } from "@/types/custom-portal";

export async function GET() {
  return proxyToBackend<CustomPortalOverviewDTO>("/api/company/custom-portal");
}
