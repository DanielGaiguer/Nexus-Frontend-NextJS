import { proxyToBackend } from "@/lib/route-handlers";
import type { TrackPortalEventBody } from "@/types/custom-portal";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/public/custom-portal/[subdomain]/events">
) {
  const { subdomain } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as TrackPortalEventBody;
  return proxyToBackend<unknown>(
    `/api/public/custom-portal/${encodeURIComponent(subdomain)}/events`,
    { method: "POST", body, requireAuth: false }
  );
}
