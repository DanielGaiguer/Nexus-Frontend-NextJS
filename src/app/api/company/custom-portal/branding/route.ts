import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CustomPortalDTO,
  UpdateCustomPortalBrandingBody,
} from "@/types/custom-portal";

export async function PUT(request: Request) {
  const body = (await request.json()) as UpdateCustomPortalBrandingBody;
  return proxyToBackend<CustomPortalDTO>(
    "/api/company/custom-portal/branding",
    {
      method: "PUT",
      body,
    }
  );
}
