import { proxyToBackend } from "@/lib/route-handlers";
import type { MatchResponseDTO } from "@/types/match";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/companies/[companyId]/matches">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<MatchResponseDTO[]>(
    `/api/admin/companies/${companyId}/matches`
  );
}
