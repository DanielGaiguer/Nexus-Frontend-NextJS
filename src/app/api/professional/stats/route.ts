import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalStatsDTO } from "@/types/professional";

export async function GET() {
  return proxyToBackend<ProfessionalStatsDTO>("/api/professional/stats");
}
