import { proxyToBackend } from "@/lib/route-handlers";
import type { MapProfessionalDTO } from "@/types/map";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<MapProfessionalDTO[]>(
    `/api/map/professionals${qs ? `?${qs}` : ""}`
  );
}
