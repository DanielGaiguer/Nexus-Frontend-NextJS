import { jwtVerify } from "jose";

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
