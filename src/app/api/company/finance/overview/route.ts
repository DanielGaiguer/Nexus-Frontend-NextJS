import { proxyToBackend } from "@/lib/route-handlers";
import type { ContractorFinanceOverviewDTO } from "@/types/finance";

export async function GET() {
  return proxyToBackend<ContractorFinanceOverviewDTO>(
    "/api/company/finance/overview"
  );
}
