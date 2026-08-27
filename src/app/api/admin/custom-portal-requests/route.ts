import { proxyToBackend } from "@/lib/route-handlers";
import type { CustomPortalRequestDTO } from "@/types/custom-portal";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<CustomPortalRequestDTO[]>(
    `/api/admin/custom-portal-requests${qs ? `?${qs}` : ""}`
  );
}
