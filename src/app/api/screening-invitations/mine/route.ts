import { proxyToBackend } from "@/lib/route-handlers";
import type { ScreeningProcessSummaryDTO } from "@/types/screening";

export async function GET() {
  return proxyToBackend<ScreeningProcessSummaryDTO[]>(
    "/api/screening-invitations/mine"
  );
}
