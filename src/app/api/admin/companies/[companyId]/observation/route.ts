import { proxyToBackend } from "@/lib/route-handlers";
import type {
  AdminCompanyConfirmationOverviewDTO,
  AdminCompanyObservationBody,
} from "@/types/admin";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/admin/companies/[companyId]/observation">
) {
  const { companyId } = await ctx.params;
  const body = (await request.json()) as AdminCompanyObservationBody;
  return proxyToBackend<AdminCompanyConfirmationOverviewDTO>(
    `/api/admin/companies/${companyId}/observation`,
    { method: "PUT", body }
  );
}
