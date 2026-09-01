import { proxyToBackend } from "@/lib/route-handlers";
import type { CommissionChargeDTO } from "@/types/billing";

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
  return proxyToBackend<CommissionChargeDTO[]>(
    `/api/admin/commission-charges${suffix}`
  );
}
