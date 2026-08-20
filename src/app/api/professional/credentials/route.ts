import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalCredentialDTO } from "@/types/professional";

export async function GET() {
  return proxyToBackend<ProfessionalCredentialDTO[]>(
    "/api/professional/credentials"
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as ProfessionalCredentialDTO;
  return proxyToBackend<string, { message: string }>(
    "/api/professional/credentials",
    { method: "POST", body, transform: (message) => ({ message }) }
  );
}
