import { jwtVerify } from "jose";
import { cookies } from "next/headers";

import type { SessionClaims } from "@/types/auth";

/**
 * Mecânica do cookie de sessão do BFF.
 *
 * O JWT é o mesmo que o Spring Boot já emite (ver
 * `com.main.nexus.service.TokenService#generateToken`): HS256, assinado com
 * `api.security.token.secret` (base64) do backend. Pra `verifySessionToken`
 * conseguir validar a assinatura sem bater no backend a cada navegação, o
 * Next precisa da MESMA secret em `JWT_SECRET` (ver .env.local.example) —
 * duas cópias do mesmo segredo, cada uma só legível pelo seu próprio
 * servidor, nunca pelo browser.
 */

export const SESSION_COOKIE_NAME = "nexus_token";

/** Espelha o `expiration` de 1h que TokenService#generateToken hoje aplica. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60;

/**
 * Domínio raiz do produto, sem porta. Dev: "localhost". Prod: "nexus.com.br".
 * Também usado pelo proxy pra decidir se um Host é um subdomínio de tenant.
 */
export function rootDomain(): string {
  const raw = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase();
  return (raw && raw.split(":")[0]) || "localhost";
}

/**
 * `Domain` do cookie de sessão. Precisa ser compartilhado entre o domínio
 * principal e os subdomínios de plataforma personalizada
 * (`empresa.nexus.com.br`) para o profissional se candidatar sem sair do
 * portal (Prompt 3).
 *
 * - `NEXT_PUBLIC_ROOT_DOMAIN` não configurado → `undefined` (cookie host-only,
 *   comportamento inalterado pra setups que não usam a feature).
 * - `localhost` / `127.0.0.1` → `undefined` (não dá pra compartilhar entre
 *   `*.localhost` de forma confiável em todo browser; teste de candidatura
 *   local roda no domínio principal).
 * - domínio real → `.nexus.com.br`.
 *
 * `SESSION_COOKIE_DOMAIN` sobrepõe (use `none` pra forçar host-only).
 */
export function sessionCookieDomain(): string | undefined {
  const explicit = process.env.SESSION_COOKIE_DOMAIN?.trim();
  if (explicit) return explicit === "none" ? undefined : explicit;

  const raw = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase();
  if (!raw) return undefined;
  const host = raw.split(":")[0];
  if (!host || host === "localhost" || host === "127.0.0.1") return undefined;
  return `.${host}`;
}

/** Opções do cookie de sessão — um único lugar pra login / OAuth complete. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    domain: sessionCookieDomain(),
  };
}

/** Mesmas chaves de escopo, expirando o cookie — pro logout limpar de fato. */
export function sessionCookieClearOptions() {
  return { ...sessionCookieOptions(), maxAge: 0 };
}

function getSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new Uint8Array(Buffer.from(secret, "base64"));
}

/**
 * Verifica a assinatura e a expiração do token. Retorna `null` (não lança)
 * em qualquer cenário inválido — token ausente, expirado, assinatura errada,
 * ou `JWT_SECRET` não configurado — porque quem chama só precisa decidir
 * "autenticado ou não", nunca precisa distinguir a causa.
 */
export async function verifySessionToken(
  token: string | undefined
): Promise<SessionClaims | null> {
  if (!token) return null;

  const key = getSecretKey();
  if (!key) return null;

  try {
    const { payload } = await jwtVerify(token, key);
    const { id, email, role } = payload as Record<string, unknown>;
    if (
      typeof id !== "number" ||
      typeof email !== "string" ||
      typeof role !== "string"
    ) {
      return null;
    }
    return { id, email, role: role as SessionClaims["role"] };
  } catch {
    return null;
  }
}

/** Lê o cookie de sessão da request atual (Server Component/Route Handler). */
export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
}

/** `getSessionToken` + `verifySessionToken` num só passo. */
export async function getSession(): Promise<SessionClaims | null> {
  return verifySessionToken(await getSessionToken());
}
