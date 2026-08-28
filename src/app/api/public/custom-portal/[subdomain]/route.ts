import { proxyToBackend } from "@/lib/route-handlers";
import type { PublicCustomPortalDTO } from "@/types/custom-portal";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/public/custom-portal/[subdomain]">
) {
  const { subdomain } = await ctx.params;
  return proxyToBackend<PublicCustomPortalDTO>(
    `/api/public/custom-portal/${encodeURIComponent(subdomain)}`,
    { requireAuth: false }
  );
}
