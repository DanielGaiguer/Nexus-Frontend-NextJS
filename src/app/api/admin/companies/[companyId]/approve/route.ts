import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/admin/companies/[companyId]/approve">
) {
  const { companyId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/admin/companies/${companyId}/approve`,
    { method: "POST", transform: (message) => ({ message }) }
  );
}
