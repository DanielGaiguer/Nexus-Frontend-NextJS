/**
 * Tracking anônimo da página pública da plataforma personalizada. Fire-and-forget
 * — nada aqui pode quebrar a página. Tudo protegido por try/catch porque
 * localStorage/sessionStorage podem lançar (modo privado, storage bloqueado).
 *
 * O backend (endpoint público) ignora eventos de portal inexistente/inativo e
 * limita duração/tamanho de strings.
 */

import type {
  CustomPortalEventType,
  TrackPortalEventBody,
} from "@/types/custom-portal";

const VISITOR_KEY = "nexus_portal_vid";
const SESSION_START_KEY = "nexus_portal_session_start";
const SESSION_ENDED_KEY = "nexus_portal_session_ended";

// Dedupe de PAGE_VIEW no mesmo path por ~2s — evita contagem dobrada do
// StrictMode em dev e de re-render rápido.
const recentViews = new Set<string>();

function safeLocal(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function safeSession(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function getVisitorId(): string {
  const ls = safeLocal();
  try {
    let id = ls?.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      id = id.slice(0, 40);
      ls?.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function referrerHost(): string | null {
  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).host.toLowerCase();
    if (!host || host === window.location.host) return null; // ignora navegação interna
    return host;
  } catch {
    return null;
  }
}

function send(subdomain: string, body: TrackPortalEventBody, beacon = false) {
  const url = `/api/public/custom-portal/${encodeURIComponent(subdomain)}/events`;
  const payload = JSON.stringify(body);
  try {
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(
        url,
        new Blob([payload], { type: "application/json" })
      );
      return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignora */
  }
}

export function trackPageView(
  subdomain: string,
  path: string,
  opportunityId?: number | null
) {
  if (recentViews.has(path)) return;
  recentViews.add(path);
  setTimeout(() => recentViews.delete(path), 2000);

  const ss = safeSession();
  try {
    if (!ss?.getItem(SESSION_START_KEY)) {
      ss?.setItem(SESSION_START_KEY, String(Date.now()));
      ss?.removeItem(SESSION_ENDED_KEY);
    }
  } catch {
    /* ignora */
  }

  send(subdomain, {
    visitorId: getVisitorId(),
    type: "PAGE_VIEW",
    path,
    opportunityId: opportunityId ?? null,
    referrerHost: referrerHost(),
  });
}

export function trackApplyClick(
  subdomain: string,
  path: string,
  opportunityId: number
) {
  send(subdomain, {
    visitorId: getVisitorId(),
    type: "APPLY_CLICK",
    path,
    opportunityId,
  });
}

/** Dispara no pagehide — fecha a sessão com o tempo total na plataforma. */
export function endPortalSession(subdomain: string) {
  const ss = safeSession();
  try {
    const start = Number(ss?.getItem(SESSION_START_KEY));
    if (!start || ss?.getItem(SESSION_ENDED_KEY)) return;
    ss?.setItem(SESSION_ENDED_KEY, "1");
    const durationSeconds = Math.round((Date.now() - start) / 1000);
    if (durationSeconds < 1) return;
    send(
      subdomain,
      {
        visitorId: getVisitorId(),
        type: "SESSION_END" as CustomPortalEventType,
        durationSeconds,
      },
      true
    );
  } catch {
    /* ignora */
  }
}
