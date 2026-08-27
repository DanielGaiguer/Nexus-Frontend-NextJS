import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CreateCustomPortalBody,
  CustomPortalDTO,
} from "@/types/custom-portal";

export async function GET() {
  return proxyToBackend<CustomPortalDTO[]>("/api/admin/custom-portals");
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateCustomPortalBody;
  return proxyToBackend<CustomPortalDTO>("/api/admin/custom-portals", {
    method: "POST",
    body,
  });
}
