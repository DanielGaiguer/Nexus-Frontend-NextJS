import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CompanyInvitationDTO,
  InviteMemberRequestBody,
} from "@/types/members";

export async function POST(request: Request) {
  const body = (await request.json()) as InviteMemberRequestBody;
  return proxyToBackend<CompanyInvitationDTO>("/api/company/members/invite", {
    method: "POST",
    body,
  });
}
