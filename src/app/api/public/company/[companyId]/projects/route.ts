import { proxyToBackend } from "@/lib/route-handlers";
import type { ProjectResponseDTO } from "@/types/project";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/public/company/[companyId]/projects">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<ProjectResponseDTO[]>(
    `/api/public/company/${companyId}/projects`,
    { requireAuth: false }
  );
}
