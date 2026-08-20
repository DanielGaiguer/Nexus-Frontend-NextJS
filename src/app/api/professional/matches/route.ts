import { proxyToBackend } from "@/lib/route-handlers";
import type { MatchResponseDTO } from "@/types/match";

export async function GET() {
  return proxyToBackend<MatchResponseDTO[]>("/api/professional/matches");
}
