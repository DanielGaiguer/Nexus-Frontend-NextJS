import { proxyToBackend } from "@/lib/route-handlers";
import type { CommissionChargeDTO } from "@/types/billing";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/commission-charges/[chargeId]/simulate">
) {
  const { chargeId } = await ctx.params;
  const body = (await request.json()) as { outcome: "approved" | "rejected" };
  return proxyToBackend<CommissionChargeDTO>(
    `/api/admin/commission-charges/${chargeId}/simulate`,
    { method: "POST", body }
  );
}
