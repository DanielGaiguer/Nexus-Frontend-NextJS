/**
 * Client HTTP centralizado — ponto único de montagem de URL, tanto para o
 * lado servidor falar com o Spring Boot quanto para os hooks de client
 * component falarem com os próprios Route Handlers do Next. Nenhum hook
 * deve montar URL na mão.
 *
 * `ApiError` normaliza o corpo de erro que o `ApiExceptionHandler` do
 * backend já devolve (`{ "status": 409, "message": "..." }`) numa exceção
 * só, pra quem chama poder jogar `error.message` direto num toast do sonner
 * — `.message` já vem traduzido pro português (ver api-error-messages.ts),
 * então nenhuma tela precisa se preocupar com isso.
 */

import { translateApiError } from "@/lib/api-error-messages";

export class ApiError extends Error {
  readonly status: number;
  /**
   * Texto original que o backend mandou (quase sempre em inglês) — só pra
   * quem precisa decidir um fluxo com base no motivo exato (ex.:
   * ReviewForm/ReviewPageContent distinguindo "status check pendente" de
   * "sem contato"). Nunca deve ir pra UI — pra isso é `.message`, que já
   * vem traduzido.
   */
  readonly reason: string;

  constructor(status: number, reason: string, message: string = reason) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reason = reason;
  }
}

/**
 * `ProjectResponseDTO.workMode` chega do backend serializado sob a chave
 * `"modality"` (`@JsonProperty("modality")` em ProjectResponseDTO.java no
 * backend — mantido de propósito porque o nexus-frontend legado ainda
 * consome esse mesmo endpoint esperando essa chave). Todo o resto deste
 * frontend — tipos, filtros de mapa/oportunidades, telas — já assume
 * `workMode` desde o início; em vez de espalhar esse detalhe de
 * serialização por ~15 hooks e telas diferentes (e continuar arriscando
 * esquecer um), corrige aqui, no único ponto por onde toda resposta JSON
 * passa (`apiFetch` e `backendFetch`). Reviver do `JSON.parse` percorre a
 * árvore de baixo pra cima sozinho, então cobre objeto único, listas e o
 * `match.project` aninhado, sem precisar andar a árvore na mão.
 */
function reviveWorkMode(_key: string, value: unknown): unknown {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "modality" in value &&
    !("workMode" in value)
  ) {
    (value as Record<string, unknown>).workMode = (
      value as Record<string, unknown>
    ).modality;
  }
  return value;
}

/**
 * `translate` é `true` só pra quem fala direto com o Spring Boot
 * (`backendFetch`) — é ali que o texto cru em inglês existe e precisa virar
 * português. `apiFetch` fala com nossos próprios Route Handlers, que já
 * devolvem `.message` traduzido (ver `proxyToBackend`) — traduzir de novo
 * ali re-analisaria um texto que já é português e poderia perder
 * especificidade (ex.: cair no genérico por status em vez da mensagem
 * exata), então nesse caso o texto só é repassado como está.
 */
async function parseResponse<T>(
  response: Response,
  translate: boolean
): Promise<T> {
  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson
    ? JSON.parse(await response.text(), reviveWorkMode)
    : await response.text();

  if (!response.ok) {
    const text =
      isJson && payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message)
        : typeof payload === "string" && payload
          ? payload
          : response.statusText;
    // Quando o corpo já carrega o motivo original separado (Route Handler
    // repassando uma ApiError — ver proxyToBackend), preserva ele em vez do
    // `text` (que ali já é a versão traduzida) — é o que permite quem
    // precisa do texto cru (ex.: ReviewForm) continuar funcionando mesmo
    // depois do Route Handler já ter traduzido `.message`.
    const reason =
      isJson && payload && typeof payload === "object" && "reason" in payload
        ? String((payload as { reason?: unknown }).reason)
        : text;
    const message = translate ? translateApiError(response.status, text) : text;
    throw new ApiError(response.status, reason, message);
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

  return parseResponse<T>(response, true);
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

  return parseResponse<T>(response, false);
}
