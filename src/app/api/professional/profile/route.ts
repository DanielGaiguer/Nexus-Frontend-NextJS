import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalProfileDTO } from "@/types/professional";

export async function GET() {
  return proxyToBackend<ProfessionalProfileDTO>("/api/professional/profile");
}

export async function PUT(request: Request) {
  const body = (await request.json()) as ProfessionalProfileDTO;
  return proxyToBackend<ProfessionalProfileDTO>("/api/professional/profile", {
    method: "PUT",
    body,
  });
}
