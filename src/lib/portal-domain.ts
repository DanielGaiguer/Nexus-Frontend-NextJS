/**
 * Helpers client-safe pra montar links absolutos entre o domínio principal do
 * Nexus e os subdomínios de plataforma personalizada. `NEXT_PUBLIC_ROOT_DOMAIN`
 * é inlinado no bundle do browser, então dá pra ler aqui.
 */

/** Domínio raiz "visível" (com porta, se houver). Ex.: "localhost:8082", "nexus.com.br". */
export function rootDomainClient(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "localhost:8082";
}

function protocolFor(host: string): string {
  return host.startsWith("localhost") || host.startsWith("127.0.0.1")
    ? "http"
    : "https";
}

/** URL absoluta no domínio PRINCIPAL do Nexus (pra sair do subdomínio do portal). */
export function nexusUrl(path = "/"): string {
  const host = rootDomainClient();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${protocolFor(host)}://${host}${suffix}`;
}
