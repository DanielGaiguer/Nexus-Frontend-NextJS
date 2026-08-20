import { proxyToBackend } from "@/lib/route-handlers";
import type { AdminSkillDTO, SkillRequestDTO } from "@/types/admin";

export async function GET() {
  return proxyToBackend<AdminSkillDTO[]>("/api/admin/skills");
}

export async function POST(request: Request) {
  const body = (await request.json()) as SkillRequestDTO;
  return proxyToBackend<string, { message: string }>("/api/admin/skills", {
    method: "POST",
    body,
    transform: (message) => ({ message }),
  });
}
