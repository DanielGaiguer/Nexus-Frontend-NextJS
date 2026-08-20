import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalDashboardDTO } from "@/types/admin";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/professionals/[professionalId]/dashboard">
) {
  const { professionalId } = await ctx.params;
  return proxyToBackend<ProfessionalDashboardDTO>(
    `/api/admin/professionals/${professionalId}/dashboard`
  );
}
