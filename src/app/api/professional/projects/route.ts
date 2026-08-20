import { proxyToBackend } from "@/lib/route-handlers";
import type { PreviousProjectDTO } from "@/types/previous-project";

export async function GET() {
  return proxyToBackend<PreviousProjectDTO[]>("/api/professional/projects");
}

export async function POST(request: Request) {
  const body = (await request.json()) as PreviousProjectDTO;
  return proxyToBackend<string, { message: string }>(
    "/api/professional/projects",
    {
      method: "POST",
      body,
      transform: (message) => ({ message }),
    }
  );
}
