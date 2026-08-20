import { proxyToBackend } from "@/lib/route-handlers";
import type { ProfessionalCredentialDTO } from "@/types/professional";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/professional/credentials/[credentialId]">
) {
  const { credentialId } = await ctx.params;
  const body = (await request.json()) as ProfessionalCredentialDTO;
  return proxyToBackend<string, { message: string }>(
    `/api/professional/credentials/${credentialId}`,
    { method: "PUT", body, transform: (message) => ({ message }) }
  );
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/professional/credentials/[credentialId]">
) {
  const { credentialId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/professional/credentials/${credentialId}`,
    { method: "DELETE", transform: (message) => ({ message }) }
  );
}
