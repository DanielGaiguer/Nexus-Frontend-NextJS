import { proxyToBackend } from "@/lib/route-handlers";
import type { RejectCompanyRequestDTO } from "@/types/admin";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/companies/[companyId]/reject">
) {
  const { companyId } = await ctx.params;
  const body = (await request.json()) as RejectCompanyRequestDTO;
  return proxyToBackend<string, { message: string }>(
    `/api/admin/companies/${companyId}/reject`,
    { method: "POST", body, transform: (message) => ({ message }) }
  );
}
