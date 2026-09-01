import { proxyToBackend } from "@/lib/route-handlers";
import type {
  OpenSupportTicketBody,
  SupportConversationDTO,
} from "@/types/support";

export async function GET() {
  return proxyToBackend<SupportConversationDTO[]>("/api/support/conversations");
}

export async function POST(request: Request) {
  const body = (await request.json()) as OpenSupportTicketBody;
  return proxyToBackend<SupportConversationDTO>("/api/support/conversations", {
    method: "POST",
    body,
  });
}
