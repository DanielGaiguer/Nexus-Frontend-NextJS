import { proxyToBackend } from "@/lib/route-handlers";
import type { AdminMatchConfirmationDTO } from "@/types/admin";

export async function GET() {
  return proxyToBackend<AdminMatchConfirmationDTO[]>(
    "/api/admin/confirmations/pending-reconciliation"
  );
}
