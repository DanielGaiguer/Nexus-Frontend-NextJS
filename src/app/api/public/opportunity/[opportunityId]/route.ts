import { proxyToBackend } from "@/lib/route-handlers";
import type { ProjectResponseDTO } from "@/types/project";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/public/opportunity/[opportunityId]">
) {
  const { opportunityId } = await ctx.params;
  // `/api/public/**` é permitAll no backend — este endpoint também alimenta a
  // página pública do portal (empresa.nexus.com.br), acessada sem sessão.
  return proxyToBackend<ProjectResponseDTO>(
    `/api/public/opportunity/${opportunityId}`,
    { requireAuth: false }
  );
}
