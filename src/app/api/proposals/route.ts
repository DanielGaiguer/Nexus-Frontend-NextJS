import { proxyToBackend } from "@/lib/route-handlers";
import type { ProposalRequestDTO, ProposalResponseDTO } from "@/types/proposal";

export async function POST(request: Request) {
  const body = (await request.json()) as ProposalRequestDTO;
  return proxyToBackend<ProposalResponseDTO>("/api/proposals", {
    method: "POST",
    body,
  });
}
