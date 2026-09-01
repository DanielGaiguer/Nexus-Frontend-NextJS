import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CompanyFiscalProfileDTO,
  UpdateCompanyFiscalProfileBody,
} from "@/types/nfse";

export async function GET() {
  return proxyToBackend<CompanyFiscalProfileDTO>(
    "/api/company/billing/fiscal-profile"
  );
}

export async function PUT(request: Request) {
  const body = (await request.json()) as UpdateCompanyFiscalProfileBody;
  return proxyToBackend<CompanyFiscalProfileDTO>(
    "/api/company/billing/fiscal-profile",
    { method: "PUT", body }
  );
}
