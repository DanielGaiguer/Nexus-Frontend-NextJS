import { proxyToBackend } from "@/lib/route-handlers";
import type { UserSummaryDTO } from "@/types/admin";

export async function GET() {
  return proxyToBackend<UserSummaryDTO[]>("/api/admin/users");
}
