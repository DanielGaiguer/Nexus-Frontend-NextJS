import { proxyToBackend } from "@/lib/route-handlers";
import type {
  ApproveCustomPortalRequestBody,
  CustomPortalDTO,
} from "@/types/custom-portal";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/custom-portal-requests/[requestId]/approve">
) {
  const { requestId } = await ctx.params;
  const body = (await request.json()) as ApproveCustomPortalRequestBody;
  return proxyToBackend<CustomPortalDTO>(
    `/api/admin/custom-portal-requests/${requestId}/approve`,
    { method: "POST", body }
  );
}
