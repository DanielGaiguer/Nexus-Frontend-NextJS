import { proxyToBackend } from "@/lib/route-handlers";
import type { CandidateComparisonResponseDTO } from "@/types/comparison";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<CandidateComparisonResponseDTO>(
    `/api/comparison/candidates/mine${qs ? `?${qs}` : ""}`,
    { method: "POST" }
  );
}
