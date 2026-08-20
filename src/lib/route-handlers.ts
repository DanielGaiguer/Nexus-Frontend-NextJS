import { NextResponse } from "next/server";

import {
  ApiError,
  backendFetch,
  type BackendFetchOptions,
} from "@/lib/api-client";
import { getSessionToken } from "@/lib/session";

/**
 * Fábrica de Route Handlers "proxy puro" — GET/POST que só repassam pro
 * Spring Boot (opcionalmente com o Bearer token da sessão) e traduzem
 * `ApiError` numa resposta JSON no mesmo formato de erro. Existe pra não
 * repetir esse try/catch em cada `route.ts` de entidade
 * (professional/profile, company/profile, analytics/*, ...).
 */
export async function proxyToBackend<T, R = T>(
  path: string,
  options: BackendFetchOptions & {
    requireAuth?: boolean;
    /**
     * Alguns endpoints do backend (os de registro) devolvem texto puro
     * (`ResponseEntity<String>`), não JSON — use isto pra moldar a resposta
     * num shape previsível (`{ message: "..." }`) antes de mandar pro
     * client.
     */
    transform?: (data: T) => R;
  } = {}
): Promise<NextResponse> {
  const { requireAuth = true, transform, ...backendOptions } = options;

  let token: string | undefined;
  if (requireAuth) {
    token = await getSessionToken();
    if (!token) {
      return NextResponse.json(
        { message: "Sessão inválida ou expirada." },
        { status: 401 }
      );
    }
  }

  try {
    const data = await backendFetch<T>(path, { ...backendOptions, token });
    return NextResponse.json(transform ? transform(data) : data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { message: "Não foi possível falar com o servidor. Tente novamente." },
      { status: 502 }
    );
  }
}
