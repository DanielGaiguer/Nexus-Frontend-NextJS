import { proxyToBackend } from "@/lib/route-handlers";
import type { RegisterCompanyLinkedInRequestDTO } from "@/types/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterCompanyLinkedInRequestDTO;
  return proxyToBackend<string, { message: string }>(
    "/api/auth/register/company/linkedin",
    {
      method: "POST",
      body,
      requireAuth: false,
      transform: (message) => ({ message }),
    }
  );
}
