import { proxyToBackend } from "@/lib/route-handlers";
import type {
  OpenSupportConversationBody,
  SupportConversationDTO,
} from "@/types/support";

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
  return proxyToBackend<SupportConversationDTO[]>(
    `/api/admin/support/conversations${suffix}`
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as OpenSupportConversationBody;
  return proxyToBackend<SupportConversationDTO>(
    "/api/admin/support/conversations",
    { method: "POST", body }
  );
}
