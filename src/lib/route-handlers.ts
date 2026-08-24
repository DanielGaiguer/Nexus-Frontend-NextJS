import { NextResponse } from "next/server";

import { translateApiError } from "@/lib/api-error-messages";
import {
  ApiError,
  backendFetch,
  type BackendFetchOptions,
} from "@/lib/api-client";
import { getSessionToken } from "@/lib/session";

/**
 * Como proxyToBackend, mas pra respostas binárias (PDF do currículo, export
 * de perfil) — não dá pra passar por `backendFetch`/`parseResponse`, que só
 * sabem lidar com JSON/texto.
 */
export async function proxyBinary(
  path: string,
  contentType: string
): Promise<NextResponse> {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json(
      { message: "Sessão inválida ou expirada." },
      { status: 401 }
    );
  }

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8081";
  const response = await fetch(`${backendUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    // ApiExceptionHandler no backend sempre devolve JSON (`{status,
    // message}`), mesmo pros endpoints binários — só cai pro texto cru (ou
    // pro fallback) se, por algum motivo, o corpo não vier nesse formato.
    const body = await response.text();
    let reason = body;
    try {
      const parsed = JSON.parse(body) as { message?: unknown };
      if (parsed && typeof parsed.message === "string") reason = parsed.message;
    } catch {
      // corpo não era JSON — usa o texto cru mesmo
    }
    return NextResponse.json(
      {
        message: reason
          ? translateApiError(response.status, reason)
          : "Não foi possível obter o arquivo.",
        reason,
      },
      { status: response.status }
    );
  }

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition":
        response.headers.get("content-disposition") ?? "inline",
    },
  });
}

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
      // `reason` viaja junto (não traduzido) pra quem no client precisa
      // decidir um fluxo com base no motivo exato que o backend mandou —
      // ver ApiError/parseResponse em api-client.ts.
      return NextResponse.json(
        { message: error.message, reason: error.reason },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { message: "Não foi possível falar com o servidor. Tente novamente." },
      { status: 502 }
    );
  }
}
