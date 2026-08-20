import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import type { UserRole } from "@/types/auth";

const roleHome: Record<UserRole, string> = {
  PROFESSIONAL: "/pro/dashboard",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/dashboard",
};

/**
 * Substitui o antigo `middleware.ts` — no Next 16 o file convention foi
 * renomeado pra `proxy.ts` (mesma API, `middleware()` virou `proxy()`).
 *
 * Isto é só o gate de UX (evita renderizar uma tela protegida pra depois
 * redirecionar); a fonte da verdade de autorização continua sendo o Spring
 * Boot, que valida o Bearer token de novo em cada chamada de API. Ver
 * src/lib/session.ts para o porquê de verificar a assinatura aqui em vez de
 * só checar se o cookie existe.
 *
 * Rotas públicas ainda cabem numa lista pequena porque as telas de negócio
 * (dashboard, projetos, chat, ...) chegam nos próximos prompts desta mesma
 * migração — à medida que forem entrando, adicione o prefixo aqui.
 */
const PUBLIC_PATHS = ["/", "/login", "/register", "/theme-test"];

// `/public/**` no app antigo era servido fora do shell autenticado, sem
// exigir login (link compartilhável). Este projeto ainda não tem site
// público de verdade — decisão já tomada e documentada no Prompt 4: as
// telas `/public/**` daqui vivem dentro do shell autenticado por
// consistência, então continuam exigindo sessão como qualquer outra rota
// de `(app)` — não estão na lista de PUBLIC_PATHS de propósito.

// Rotas de auth (/login, /register/**) que não fazem sentido revisitar já
// logado — manda direto pro dashboard do papel em vez de mostrar o form de novo.
const AUTH_ONLY_PATHS = ["/login", "/register"];

// Prefixo -> papel exigido. Espelha o AuthInterceptor do nexus-frontend
// (addPathPatterns("/pro/**", "/company/**", "/admin/**") + o if/else de
// userRole ali dentro) — lá isso valia tanto pra a página quanto pro dado,
// porque tudo vinha embutido no HTML da própria rota. Aqui a página
// (`/admin/**`) e o dado (`/api/admin/**`) são coisas separadas; o dado já
// é protegido pelo SecurityConfig do backend real (`hasRole("ADMIN")` etc,
// verificado com curl — um token PROFESSIONAL toma 403 de verdade), então
// isto aqui é a segunda camada: sem ela, um usuário do papel errado ainda
// conseguia abrir o shell da tela (só os dados vinham vazios/com erro).
const ROLE_PATHS: Record<string, UserRole> = {
  "/pro": "PROFESSIONAL",
  "/company": "COMPANY",
  "/admin": "ADMIN",
};

function matchesPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => matchesPath(pathname, path));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (session && AUTH_ONLY_PATHS.some((path) => matchesPath(pathname, path))) {
    return NextResponse.redirect(new URL(roleHome[session.role], request.url));
  }

  if (!isPublicPath(pathname) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    const requiredRole = Object.entries(ROLE_PATHS).find(([prefix]) =>
      matchesPath(pathname, prefix)
    )?.[1];
    if (requiredRole && session.role !== requiredRole) {
      return NextResponse.redirect(
        new URL(roleHome[session.role], request.url)
      );
    }

    // Status check só é respondido pela empresa — mesma regra especial do
    // AuthInterceptor original (`uri.contains("/status-check")`).
    if (pathname.includes("/status-check") && session.role !== "COMPANY") {
      return NextResponse.redirect(
        new URL(roleHome[session.role], request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
