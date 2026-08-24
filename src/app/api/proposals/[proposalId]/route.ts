import { proxyToBackend } from "@/lib/route-handlers";
import type { ProposalRequestDTO, ProposalResponseDTO } from "@/types/proposal";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/proposals/[proposalId]">
) {
  const { proposalId } = await ctx.params;
  return proxyToBackend<ProposalResponseDTO>(`/api/proposals/${proposalId}`);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/proposals/[proposalId]">
) {
  const { proposalId } = await ctx.params;
  const body = (await request.json()) as ProposalRequestDTO;
  return proxyToBackend<ProposalResponseDTO>(`/api/proposals/${proposalId}`, {
    method: "PUT",
    body,
  });
}
