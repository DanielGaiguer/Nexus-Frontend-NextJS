import { proxyToBackend } from "@/lib/route-handlers";
import type { SupportConversationDTO } from "@/types/support";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/support/conversations/[conversationId]">
) {
  const { conversationId } = await ctx.params;
  return proxyToBackend<SupportConversationDTO>(
    `/api/admin/support/conversations/${conversationId}`
  );
}
