import { proxyToBackend } from "@/lib/route-handlers";
import type { CustomPortalDTO } from "@/types/custom-portal";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/custom-portals/[portalId]/branding/image">
) {
  const { portalId } = await ctx.params;
  const kind = new URL(request.url).searchParams.get("kind") ?? "";
  const formData = await request.formData();
  return proxyToBackend<CustomPortalDTO>(
    `/api/admin/custom-portals/${portalId}/branding/image?kind=${encodeURIComponent(kind)}`,
    { method: "POST", body: formData }
  );
}

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/admin/custom-portals/[portalId]/branding/image">
) {
  const { portalId } = await ctx.params;
  const kind = new URL(request.url).searchParams.get("kind") ?? "";
  return proxyToBackend<CustomPortalDTO>(
    `/api/admin/custom-portals/${portalId}/branding/image?kind=${encodeURIComponent(kind)}`,
    { method: "DELETE" }
  );
}
