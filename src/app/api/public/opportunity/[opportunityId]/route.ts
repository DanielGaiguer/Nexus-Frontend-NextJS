import { proxyToBackend } from "@/lib/route-handlers";
import type { ProjectResponseDTO } from "@/types/project";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/public/opportunity/[opportunityId]">
) {
  const { opportunityId } = await ctx.params;
  return proxyToBackend<ProjectResponseDTO>(
    `/api/public/opportunity/${opportunityId}`
  );
}
