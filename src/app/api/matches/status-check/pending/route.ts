import { proxyToBackend } from "@/lib/route-handlers";
import type { PendingStatusCheckDTO } from "@/types/review";

export async function GET() {
  return proxyToBackend<PendingStatusCheckDTO>(
    "/api/matches/status-check/pending"
  );
}
