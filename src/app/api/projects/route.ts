import { proxyToBackend } from "@/lib/route-handlers";
import type { ProjectRequestDTO, ProjectResponseDTO } from "@/types/project";

export async function GET() {
  return proxyToBackend<ProjectResponseDTO[]>("/api/projects");
}

export async function POST(request: Request) {
  const body = (await request.json()) as ProjectRequestDTO;
  return proxyToBackend<ProjectResponseDTO>("/api/projects", {
    method: "POST",
    body,
  });
}
