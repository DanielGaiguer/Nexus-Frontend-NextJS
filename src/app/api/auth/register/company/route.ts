import { proxyToBackend } from "@/lib/route-handlers";
import type { RegisterCompanyRequestDTO } from "@/types/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterCompanyRequestDTO;
  return proxyToBackend<string, { message: string }>(
    "/api/auth/register/company",
    {
      method: "POST",
      body,
      requireAuth: false,
      transform: (message) => ({ message }),
    }
  );
}
