import { proxyToBackend } from "@/lib/route-handlers";
import type { ProjectResponseDTO } from "@/types/project";

export async function GET() {
  return proxyToBackend<ProjectResponseDTO[]>("/api/company/opportunities");
}
