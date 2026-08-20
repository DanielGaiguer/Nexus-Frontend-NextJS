import { proxyToBackend } from "@/lib/route-handlers";
import type { CompanyProfileDTO } from "@/types/company";

export async function GET() {
  return proxyToBackend<CompanyProfileDTO>("/api/company/profile");
}

export async function PUT(request: Request) {
  const body = (await request.json()) as CompanyProfileDTO;
  return proxyToBackend<CompanyProfileDTO>("/api/company/profile", {
    method: "PUT",
    body,
  });
}
