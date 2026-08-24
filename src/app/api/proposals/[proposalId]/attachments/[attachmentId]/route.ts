import { proxyToBackend } from "@/lib/route-handlers";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/proposals/[proposalId]/attachments/[attachmentId]">
) {
  const { proposalId, attachmentId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/proposals/${proposalId}/attachments/${attachmentId}`,
    { method: "DELETE", transform: (message) => ({ message }) }
  );
}
