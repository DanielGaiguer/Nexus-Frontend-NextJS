import { proxyToBackend } from "@/lib/route-handlers";
import type { StatusMatch } from "@/types/match";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<{ status: StatusMatch | null }>(
    `/api/matches/status-by-pair${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}
