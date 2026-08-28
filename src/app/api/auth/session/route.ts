import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

/**
 * Estado da sessão para client components que não recebem `session` via prop
 * do layout do shell — hoje, a página pública da plataforma personalizada
 * (`empresa.nexus.com.br`), que vive fora do grupo `(app)`. Lê o mesmo cookie
 * httpOnly e verifica a assinatura; nunca devolve o token.
 */
export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    session
      ? { id: session.id, email: session.email, role: session.role }
      : null
  );
}
