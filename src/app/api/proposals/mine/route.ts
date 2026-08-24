import { proxyToBackend } from "@/lib/route-handlers";
import type { ProposalResponseDTO } from "@/types/proposal";

export async function GET() {
  return proxyToBackend<ProposalResponseDTO[]>("/api/proposals/mine");
}
