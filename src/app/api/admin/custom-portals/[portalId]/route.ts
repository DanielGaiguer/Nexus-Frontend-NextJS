import { proxyToBackend } from "@/lib/route-handlers";
import type { CustomPortalDetailDTO } from "@/types/custom-portal";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/custom-portals/[portalId]">
) {
  const { portalId } = await ctx.params;
  return proxyToBackend<CustomPortalDetailDTO>(
    `/api/admin/custom-portals/${portalId}`
  );
}
