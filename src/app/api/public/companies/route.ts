import { proxyToBackend } from "@/lib/route-handlers";
import type { CompanyDirectoryPageDTO } from "@/types/company";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<CompanyDirectoryPageDTO>(
    `/api/public/companies${qs ? `?${qs}` : ""}`,
    { requireAuth: false }
  );
}
