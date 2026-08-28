/**
 * Helpers pra montar links absolutos entre o domínio principal do Nexus e os
 * subdomínios de plataforma personalizada.
 *
 * A fonte da verdade do "domínio raiz" é, em ordem:
 *   1. `NEXT_PUBLIC_ROOT_DOMAIN` (prod / quando configurado);
 *   2. o host da request atual (derivado no server e passado como prop) — é
 *      assim que a página pública do portal resolve o link de "voltar ao Nexus"
 *      sem depender de env var e sem chutar porta;
 *   3. `window.location.host` (client, quando o host atual JÁ é o domínio raiz —
 *      telas do contratante/admin).
 */

function protocolFor(host: string): string {
  return /(^|\.)localhost(:|$)/.test(host) || host.startsWith("127.0.0.1")
    ? "http"
    : "https";
}

/** URL absoluta no domínio principal do Nexus, a partir de um root host conhecido. */
export function nexusUrlFrom(rootHost: string, path = "/"): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${protocolFor(rootHost)}://${rootHost}${suffix}`;
}

/** Host publicado de uma plataforma, a partir de um root host conhecido. */
export function portalHostFrom(rootHost: string, subdomain: string): string {
  return `${subdomain}.${rootHost}`;
}

/** URL absoluta da página pública de uma plataforma, a partir de um root host conhecido. */
export function portalUrlFrom(rootHost: string, subdomain: string): string {
  const host = portalHostFrom(rootHost, subdomain);
  return `${protocolFor(host)}://${host}`;
}

/**
 * Root host resolvido client-side: env var, senão o host atual do browser.
 * Só use onde o host atual É o domínio raiz (contratante/admin) — na página
 * pública do portal, use `nexusUrlFrom`/`portalUrlFrom` com o rootHost vindo
 * do server.
 */
export function rootDomainClient(): string {
  const env = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (env) return env;
  if (typeof window !== "undefined" && window.location?.host) {
    return window.location.host;
  }
  return "localhost:3000";
}

export function nexusUrl(path = "/"): string {
  return nexusUrlFrom(rootDomainClient(), path);
}

export function portalHost(subdomain: string): string {
  return portalHostFrom(rootDomainClient(), subdomain);
}

export function portalUrl(subdomain: string): string {
  return portalUrlFrom(rootDomainClient(), subdomain);
}
