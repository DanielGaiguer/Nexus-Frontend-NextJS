import { proxyToBackend } from "@/lib/route-handlers";
import type { PortalSubscriptionChargeDTO } from "@/types/custom-portal";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/portal-subscription-charges/[id]/simulate">
) {
  const { id } = await ctx.params;
  const body = (await request.json()) as { outcome: "approved" | "rejected" };
  return proxyToBackend<PortalSubscriptionChargeDTO>(
    `/api/admin/portal-subscription-charges/${id}/simulate`,
    { method: "POST", body }
  );
}
