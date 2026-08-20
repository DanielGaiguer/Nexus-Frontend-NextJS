import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CandidateComparisonRequestDTO,
  CandidateComparisonResponseDTO,
} from "@/types/comparison";

export async function POST(request: Request) {
  const body = (await request.json()) as CandidateComparisonRequestDTO;
  return proxyToBackend<CandidateComparisonResponseDTO>(
    "/api/comparison/candidates",
    {
      method: "POST",
      body,
    }
  );
}
