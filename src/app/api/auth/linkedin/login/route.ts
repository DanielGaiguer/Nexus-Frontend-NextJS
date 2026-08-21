import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Só repassa pro backend real via 302 — precisa ser um Route Handler (não um
 * `fetch` de dentro do client component) porque o próximo passo é o
 * navegador saindo do nosso domínio de vez pra tela de login do LinkedIn.
 * `BACKEND_URL` nunca pode ir pro bundle do browser (ver
 * api-client.ts#backendFetch), então quem monta essa URL é sempre o
 * servidor. O backend devolve o usuário pra `/auth/linkedin/complete` (ver
 * aquele Route Handler) já com um JWT pronto na query string.
 */
export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8081";
  const redirect = request.nextUrl.searchParams.get("redirect");

  const target = new URL("/api/auth/linkedin/login", backendUrl);
  if (redirect) target.searchParams.set("redirect", redirect);

  return NextResponse.redirect(target);
}
