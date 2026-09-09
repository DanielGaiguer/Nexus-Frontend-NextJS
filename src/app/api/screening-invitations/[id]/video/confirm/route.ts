import { proxyToBackend } from "@/lib/route-handlers";
import type { ScreeningVideoConfirmRequestDTO } from "@/types/screening-video";

// Confirmação pós-upload: é aqui que o backend mede o tamanho real do arquivo no Supabase e
// recusa (apagando o objeto) se ele estourou o teto. O que o cliente declara não vale nada.
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/screening-invitations/[id]/video/confirm">
) {
  const { id } = await ctx.params;
  const body = (await request.json()) as ScreeningVideoConfirmRequestDTO;
  return proxyToBackend<string, { message: string }>(
    `/api/screening-invitations/${id}/video/confirm`,
    { method: "POST", body, transform: (message) => ({ message }) }
  );
}
