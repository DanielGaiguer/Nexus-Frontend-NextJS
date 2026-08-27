import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CustomPortalDTO,
  UpdateCustomPortalSubscriptionBody,
} from "@/types/custom-portal";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/admin/custom-portals/[portalId]/subscription">
) {
  const { portalId } = await ctx.params;
  const body = (await request.json()) as UpdateCustomPortalSubscriptionBody;
  return proxyToBackend<CustomPortalDTO>(
    `/api/admin/custom-portals/${portalId}/subscription`,
    { method: "PUT", body }
  );
}
