import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CustomPortalDTO,
  CustomPortalStatusChangeBody,
} from "@/types/custom-portal";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/custom-portals/[portalId]/reactivate">
) {
  const { portalId } = await ctx.params;
  const body = (await request
    .json()
    .catch(() => ({}))) as CustomPortalStatusChangeBody;
  return proxyToBackend<CustomPortalDTO>(
    `/api/admin/custom-portals/${portalId}/reactivate`,
    { method: "POST", body }
  );
}
