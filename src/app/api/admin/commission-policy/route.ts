import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CommissionPolicyDTO,
  UpdateCommissionPolicyBody,
} from "@/types/commission";

export async function GET() {
  return proxyToBackend<CommissionPolicyDTO>("/api/admin/commission-policy");
}

export async function PUT(request: Request) {
  const body = (await request.json()) as UpdateCommissionPolicyBody;
  return proxyToBackend<CommissionPolicyDTO>("/api/admin/commission-policy", {
    method: "PUT",
    body,
  });
}
