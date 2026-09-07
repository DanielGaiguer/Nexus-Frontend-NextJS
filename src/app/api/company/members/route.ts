import { proxyToBackend } from "@/lib/route-handlers";
import type { CompanyMembersResponseDTO } from "@/types/members";

// OWNER-only no backend — um MEMBER recebe 403, tratado na página.
export async function GET() {
  return proxyToBackend<CompanyMembersResponseDTO>("/api/company/members");
}
