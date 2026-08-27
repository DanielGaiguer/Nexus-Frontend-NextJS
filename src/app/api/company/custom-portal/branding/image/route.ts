import { proxyToBackend } from "@/lib/route-handlers";
import type { CustomPortalDTO } from "@/types/custom-portal";

export async function POST(request: Request) {
  const kind = new URL(request.url).searchParams.get("kind") ?? "";
  const formData = await request.formData();
  return proxyToBackend<CustomPortalDTO>(
    `/api/company/custom-portal/branding/image?kind=${encodeURIComponent(kind)}`,
    { method: "POST", body: formData }
  );
}

export async function DELETE(request: Request) {
  const kind = new URL(request.url).searchParams.get("kind") ?? "";
  return proxyToBackend<CustomPortalDTO>(
    `/api/company/custom-portal/branding/image?kind=${encodeURIComponent(kind)}`,
    { method: "DELETE" }
  );
}
