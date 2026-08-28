import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { SessionClaims } from "@/types/auth";

export const sessionKey = () => ["auth", "session"] as const;

/**
 * Sessão atual lida do cookie httpOnly via `/api/auth/session`. Usado fora do
 * shell `(app)` (página pública do portal), onde não há `session` vindo por
 * prop do layout de servidor. `null` = anônimo.
 */
export function useSession() {
  return useQuery({
    queryKey: sessionKey(),
    queryFn: () => apiFetch<SessionClaims | null>("/api/auth/session"),
    staleTime: 60_000,
  });
}
