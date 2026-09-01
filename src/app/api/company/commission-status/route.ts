import { proxyToBackend } from "@/lib/route-handlers";
import type { ContractorCommissionStatusDTO } from "@/types/commission";

export async function GET() {
  return proxyToBackend<ContractorCommissionStatusDTO>(
    "/api/company/commission-status"
  );
}
