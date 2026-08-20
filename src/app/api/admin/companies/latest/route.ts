import { proxyToBackend } from "@/lib/route-handlers";
import type { CompanyProfileDTO } from "@/types/company";

export async function GET() {
  return proxyToBackend<CompanyProfileDTO[]>("/api/admin/companies/latest");
}
