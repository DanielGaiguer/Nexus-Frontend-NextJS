import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CreateCustomPortalRequestBody,
  CustomPortalRequestDTO,
} from "@/types/custom-portal";

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => ({}))) as CreateCustomPortalRequestBody;
  return proxyToBackend<CustomPortalRequestDTO>(
    "/api/company/custom-portal/requests",
    { method: "POST", body }
  );
}
