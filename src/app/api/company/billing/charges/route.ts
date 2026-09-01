import { proxyToBackend } from "@/lib/route-handlers";
import type { CommissionChargeDTO } from "@/types/billing";

export async function GET() {
  return proxyToBackend<CommissionChargeDTO[]>("/api/company/billing/charges");
}
