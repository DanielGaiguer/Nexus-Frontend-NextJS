import { proxyToBackend } from "@/lib/route-handlers";
import type { AiExtractionResponseDTO } from "@/types/project";

export async function POST(request: Request) {
  const body = (await request.json()) as { rawText: string };
  return proxyToBackend<AiExtractionResponseDTO>("/api/projects/ai-extract", {
    method: "POST",
    body,
  });
}
