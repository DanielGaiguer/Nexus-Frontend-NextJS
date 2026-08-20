import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalDirectoryPageDTO } from "@/types/professional";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyToBackend<ProfessionalDirectoryPageDTO>(
    `/api/public/professionals${qs ? `?${qs}` : ""}`,
    { requireAuth: false }
  );
}
