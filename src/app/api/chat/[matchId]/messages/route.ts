import { proxyToBackend } from "@/lib/route-handlers";
import type { MessageDTO } from "@/types/chat";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/chat/[matchId]/messages">
) {
  const { matchId } = await ctx.params;
  return proxyToBackend<MessageDTO[]>(`/api/chat/${matchId}/messages`);
}
