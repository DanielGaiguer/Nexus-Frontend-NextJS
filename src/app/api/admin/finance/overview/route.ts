import { proxyToBackend } from "@/lib/route-handlers";
import type { AdminFinanceOverviewDTO } from "@/types/finance";

export async function GET() {
  return proxyToBackend<AdminFinanceOverviewDTO>("/api/admin/finance/overview");
}
