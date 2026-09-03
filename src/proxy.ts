import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAME,
  rootDomain,
  verifySessionToken,
} from "@/lib/session";
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
// `/auth/**` são os Route Handlers de conclusão do OAuth (linkedin/github
// "complete") — chegam aqui SEM sessão ainda (é o próprio passo que planta
// o cookie), então precisam ficar públicos.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/theme-test",
  "/auth",
  // Documentos legais (LGPD) — grupo de rotas (legal). Públicos e sem
  // redirecionar usuário logado: ele precisa poder abri-los a qualquer
  // momento, inclusive a partir da tela de re-aceite.
  "/terms",
  "/privacy",
  // Confirmação de exclusão de conta (LGPD): o link vem do e-mail e pode ser
  // aberto num dispositivo sem sessão. O token na URL é a credencial.
  "/account/delete",
];

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

// Prefixo interno pra onde as requests de subdomínio de plataforma
// personalizada são reescritas. A URL no navegador continua
// `empresa.nexus.com.br/...`; internamente serve `app/(portal)/s/empresa/...`.
const PORTAL_PREFIX = "/s";

/**
 * `empresa.nexus.com.br` -> "empresa". Retorna null para o domínio principal
 * (apex, `www`, `localhost`, previews `*.vercel.app`) e para hosts que não
 * sejam um subdomínio de exatamente um nível do domínio raiz.
 * Aceita também `*.localhost` pra facilitar teste local sem editar hosts.
 */
function resolveTenant(host: string): string | null {
  if (!host) return null;
  const hostNoPort = host.split(":")[0].toLowerCase();
  const root = rootDomain(); // "localhost" ou "nexus.com.br"

  if (
    hostNoPort === root ||
    hostNoPort === `www.${root}` ||
    hostNoPort === "localhost" ||
    hostNoPort === "127.0.0.1" ||
    hostNoPort.endsWith(".vercel.app")
  ) {
    return null;
  }

  for (const base of new Set([root, "localhost"])) {
    if (hostNoPort.endsWith(`.${base}`)) {
      const sub = hostNoPort.slice(0, hostNoPort.length - base.length - 1);
      return sub && !sub.includes(".") && /^[a-z0-9-]+$/.test(sub) ? sub : null;
    }
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const tenant = resolveTenant(host);

  // Subdomínio de tenant: reescreve pra página pública do portal e para por
  // aqui — o portal é público, sem gate de sessão/papel.
  if (tenant) {
    if (
      pathname === PORTAL_PREFIX ||
      pathname.startsWith(`${PORTAL_PREFIX}/`)
    ) {
      // já é uma rota interna — não reescreve de novo
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `${PORTAL_PREFIX}/${tenant}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // No domínio principal, o prefixo interno `/s/...` não é endereçável.
  if (pathname === PORTAL_PREFIX || pathname.startsWith(`${PORTAL_PREFIX}/`)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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

    // Confirmação pós-contratação (/matches/{id}/status-check): agora respondida
    // pelos dois lados (contratante e profissional). Só o Admin não tem o que
    // fazer ali.
    if (pathname.includes("/status-check") && session.role === "ADMIN") {
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
