import { proxyToBackend } from "@/lib/route-handlers";
import type { ProposalResponseDTO } from "@/types/proposal";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/proposals/project/[projectId]">
) {
  const { projectId } = await ctx.params;
  return proxyToBackend<ProposalResponseDTO[]>(
    `/api/proposals/project/${projectId}`
  );
}
