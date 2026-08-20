import { proxyToBackend } from "@/lib/route-handlers";
import type { MapCompanyDTO } from "@/types/map";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<MapCompanyDTO[]>(
    `/api/map/companies${qs ? `?${qs}` : ""}`
  );
}
