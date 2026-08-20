/**
 * Client HTTP centralizado — ponto único de montagem de URL, tanto para o
 * lado servidor falar com o Spring Boot quanto para os hooks de client
 * component falarem com os próprios Route Handlers do Next. Nenhum hook
 * deve montar URL na mão.
 *
 * `ApiError` normaliza o corpo de erro que o `ApiExceptionHandler` do
 * backend já devolve (`{ "status": 409, "message": "..." }`) numa exceção
 * só, pra quem chama poder jogar `error.message` direto num toast do sonner.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      isJson && payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message)
        : typeof payload === "string" && payload
          ? payload
          : response.statusText;
    throw new ApiError(response.status, message);
  }

  return payload as T;
}

export interface BackendFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Token JWT a enviar como `Authorization: Bearer <token>`. */
  token?: string;
}

/**
 * SÓ para uso server-side (Route Handlers, Server Components). Fala
 * diretamente com o Spring Boot via `BACKEND_URL` — uma env var sem prefixo
 * `NEXT_PUBLIC_`, então o Next já a remove de qualquer bundle enviado ao
 * browser; chamar isto de um client component resulta em URL relativa
 * quebrada, não em vazamento de endpoint interno.
 */
export async function backendFetch<T>(
  path: string,
  { body, token, headers, ...init }: BackendFetchOptions = {}
): Promise<T> {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8081";
  // FormData (upload de foto/currículo) monta seu próprio Content-Type com
  // boundary — jamais sobrescrever, e nunca JSON.stringify um FormData.
  const isFormData = body instanceof FormData;

  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
    // Servidor-a-servidor, por request de um usuário específico — nunca faz
    // sentido o Next cachear isso entre usuários diferentes.
    cache: "no-store",
  });

  return parseResponse<T>(response);
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Para uso em client components / hooks do TanStack Query. Chama uma rota
 * relativa do próprio Next (`/api/...`), same-origin — o cookie httpOnly de
 * sessão viaja sozinho, o browser nunca vê o JWT. O Route Handler do outro
 * lado é quem decide se repassa a chamada pro Spring Boot via `backendFetch`.
 */
export async function apiFetch<T>(
  path: string,
  { body, headers, ...init }: ApiFetchOptions = {}
): Promise<T> {
  const isFormData = body instanceof FormData;

  const response = await fetch(path, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: isFormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
    credentials: "same-origin",
  });

  return parseResponse<T>(response);
}
