"use client";

import { useEffect } from "react";

import { endPortalSession, trackPageView } from "@/lib/portal-analytics";

/**
 * Registra um PAGE_VIEW ao montar e fecha a sessão (SESSION_END com a duração)
 * no `pagehide`. Chamado por PortalHome e por PortalOpportunity.
 */
export function usePortalPageView(
  subdomain: string,
  path: string,
  opportunityId?: number | null
) {
  useEffect(() => {
    trackPageView(subdomain, path, opportunityId ?? null);
  }, [subdomain, path, opportunityId]);

  useEffect(() => {
    const onHide = () => endPortalSession(subdomain);
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [subdomain]);
}
