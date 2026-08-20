import { proxyToBackend } from "@/lib/route-handlers";
import type { AdminDashboardDTO } from "@/types/admin";

export async function GET() {
  return proxyToBackend<AdminDashboardDTO>("/api/admin/dashboard");
}
