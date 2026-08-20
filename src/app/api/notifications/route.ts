import { proxyToBackend } from "@/lib/route-handlers";
import type { NotificationSummaryDTO } from "@/types/notification";

export async function GET() {
  return proxyToBackend<NotificationSummaryDTO>("/api/notifications");
}
