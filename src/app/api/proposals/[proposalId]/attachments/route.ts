import { proxyToBackend } from "@/lib/route-handlers";
import type { ProposalResponseDTO } from "@/types/proposal";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/proposals/[proposalId]/attachments">
) {
  const { proposalId } = await ctx.params;
  const formData = await request.formData();
  return proxyToBackend<ProposalResponseDTO>(
    `/api/proposals/${proposalId}/attachments`,
    { method: "POST", body: formData }
  );
}
