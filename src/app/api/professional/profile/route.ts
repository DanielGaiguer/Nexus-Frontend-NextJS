import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalProfileDTO } from "@/types/professional";

export async function GET() {
  return proxyToBackend<ProfessionalProfileDTO>("/api/professional/profile");
}
