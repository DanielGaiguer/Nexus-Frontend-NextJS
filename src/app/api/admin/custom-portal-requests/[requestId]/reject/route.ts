import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CustomPortalRequestDTO,
  RejectCustomPortalRequestBody,
} from "@/types/custom-portal";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/custom-portal-requests/[requestId]/reject">
) {
  const { requestId } = await ctx.params;
  const body = (await request.json()) as RejectCustomPortalRequestBody;
  return proxyToBackend<CustomPortalRequestDTO>(
    `/api/admin/custom-portal-requests/${requestId}/reject`,
    { method: "POST", body }
  );
}
