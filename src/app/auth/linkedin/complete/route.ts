import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from "@/lib/session";
import type { UserRole } from "@/types/auth";

const roleHome: Record<UserRole, string> = {
  PROFESSIONAL: "/pro/dashboard",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/dashboard",
};

/**
 * Destino final do callback do LinkedIn no backend
 * (AuthService#loginExistingLinkedInUser / #handleLinkedInRegister) — chega
 * aqui com um JWT pronto na query string (`token=...`), o mesmo formato que
 * TokenService#generateToken sempre emite. Só planta o mesmo cookie httpOnly
 * que /api/auth/login usa (depois de verificar a assinatura — nunca confiar
 * cegamente num token que veio por query string) e manda pro dashboard
 * certo, ou pro `redirect` que o usuário estava tentando acessar antes de
 * sair pro LinkedIn.
 *
 * Fica em `/auth/**` (fora do grupo de rotas `(auth)`, que não tem esse
 * prefixo na URL) de propósito — é o path exato que o backend usa pra montar
 * o redirect (`nexus.frontend.base-url` + este path), não escolhemos.
 * Precisa estar em PUBLIC_PATHS (src/proxy.ts) pra não ser barrado antes de
 * plantar o cookie.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token = params.get("token");
  const redirect = params.get("redirect");

  const claims = token ? await verifySessionToken(token) : null;
  if (!token || !claims) {
    return NextResponse.redirect(
      new URL("/login?linkedinError=failed", request.url)
    );
  }

  const target =
    redirect && redirect.startsWith("/") ? redirect : roleHome[claims.role];
  const response = NextResponse.redirect(new URL(target, request.url));
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
