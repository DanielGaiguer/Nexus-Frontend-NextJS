import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CustomPortalDTO,
  UpdateCustomPortalBrandingBody,
} from "@/types/custom-portal";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/admin/custom-portals/[portalId]/branding">
) {
  const { portalId } = await ctx.params;
  const body = (await request.json()) as UpdateCustomPortalBrandingBody;
  return proxyToBackend<CustomPortalDTO>(
    `/api/admin/custom-portals/${portalId}/branding`,
    { method: "PUT", body }
  );
}
