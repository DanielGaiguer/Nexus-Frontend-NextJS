import { proxyToBackend } from "@/lib/route-handlers";
import type { CustomPortalAnalyticsDTO } from "@/types/custom-portal";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/admin/custom-portals/[portalId]/analytics">
) {
  const { portalId } = await ctx.params;
  const days = new URL(request.url).searchParams.get("days") ?? "30";
  return proxyToBackend<CustomPortalAnalyticsDTO>(
    `/api/admin/custom-portals/${portalId}/analytics?days=${encodeURIComponent(days)}`
  );
}
