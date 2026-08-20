import { proxyToBackend } from "@/lib/route-handlers";
import type { RegisterProfessionalRequestDTO } from "@/types/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterProfessionalRequestDTO;
  // O backend devolve texto puro (ResponseEntity<String>) nesse endpoint.
  return proxyToBackend<string, { message: string }>(
    "/api/auth/register/professional",
    {
      method: "POST",
      body,
      requireAuth: false,
      transform: (message) => ({ message }),
    }
  );
}
