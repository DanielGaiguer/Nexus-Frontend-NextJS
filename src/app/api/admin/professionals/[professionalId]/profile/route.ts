import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalProfileDTO } from "@/types/professional";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/professionals/[professionalId]/profile">
) {
  const { professionalId } = await ctx.params;
  return proxyToBackend<ProfessionalProfileDTO>(
    `/api/admin/professionals/${professionalId}/profile`
  );
}
