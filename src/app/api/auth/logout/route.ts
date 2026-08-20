import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * O backend não tem (nem precisa ter) um endpoint de logout — o JWT é
 * stateless. Deslogar é só apagar o cookie httpOnly local; o token antigo
 * fica tecnicamente válido até expirar (1h), mas sem o cookie o browser
 * nunca mais o envia de volta.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
