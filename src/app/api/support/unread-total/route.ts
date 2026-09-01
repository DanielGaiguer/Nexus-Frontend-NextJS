import { proxyToBackend } from "@/lib/route-handlers";

export async function GET() {
  return proxyToBackend<number>("/api/support/unread-total");
}
