import { proxyToBackend } from "@/lib/route-handlers";
import type { SupportMessageDTO } from "@/types/support";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/support/conversations/[conversationId]/messages">
) {
  const { conversationId } = await ctx.params;
  return proxyToBackend<SupportMessageDTO[]>(
    `/api/support/conversations/${conversationId}/messages`
  );
}
