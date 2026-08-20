import { proxyToBackend } from "@/lib/route-handlers";
import type { ChatSummaryDTO } from "@/types/chat";

export async function GET() {
  return proxyToBackend<ChatSummaryDTO[]>("/api/chat/matches");
}
