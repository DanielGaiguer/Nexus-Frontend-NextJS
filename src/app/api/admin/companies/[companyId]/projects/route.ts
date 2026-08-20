import { proxyToBackend } from "@/lib/route-handlers";
import type { ProjectResponseDTO } from "@/types/project";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/companies/[companyId]/projects">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<ProjectResponseDTO[]>(
    `/api/admin/companies/${companyId}/projects`
  );
}
