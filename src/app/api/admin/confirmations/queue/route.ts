import { proxyToBackend } from "@/lib/route-handlers";
import type { AdminConfirmationQueueItemDTO } from "@/types/admin";

export async function GET() {
  return proxyToBackend<AdminConfirmationQueueItemDTO[]>(
    "/api/admin/confirmations/queue"
  );
}
