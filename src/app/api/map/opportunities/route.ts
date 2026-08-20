import { proxyToBackend } from "@/lib/route-handlers";
import type { MapOpportunityDTO } from "@/types/map";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<MapOpportunityDTO[]>(
    `/api/map/opportunities${qs ? `?${qs}` : ""}`
  );
}
