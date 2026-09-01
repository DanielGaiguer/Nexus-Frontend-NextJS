import { proxyToBackend } from "@/lib/route-handlers";
import type { AdminCompanyConfirmationOverviewDTO } from "@/types/admin";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/companies/[companyId]/confirmations">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<AdminCompanyConfirmationOverviewDTO>(
    `/api/admin/companies/${companyId}/confirmations`
  );
}
