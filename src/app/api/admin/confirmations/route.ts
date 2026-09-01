import { proxyToBackend } from "@/lib/route-handlers";
import type { AdminMatchConfirmationDTO } from "@/types/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = new URLSearchParams();
  const status = searchParams.get("status");
  const companyId = searchParams.get("companyId");
  if (status) qs.set("status", status);
  if (companyId) qs.set("companyId", companyId);
  const suffix = qs.toString() ? `?${qs}` : "";
  return proxyToBackend<AdminMatchConfirmationDTO[]>(
    `/api/admin/confirmations${suffix}`
  );
}
