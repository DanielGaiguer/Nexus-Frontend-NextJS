import { proxyToBackend } from "@/lib/route-handlers";
import type { PreviousProjectDTO } from "@/types/previous-project";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/professionals/[professionalId]/projects">
) {
  const { professionalId } = await ctx.params;
  return proxyToBackend<PreviousProjectDTO[]>(
    `/api/admin/professionals/${professionalId}/projects`
  );
}
