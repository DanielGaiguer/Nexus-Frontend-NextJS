"use client";

import { nexusUrl, nexusUrlFrom } from "@/lib/portal-domain";
import type { CustomPortalStatus } from "@/types/custom-portal";

/**
 * Página mostrada quando o subdomínio não tem plataforma personalizada, ou ela
 * não está ACTIVE. Nunca um erro cru.
 */
export function PortalUnavailable({
  status,
  rootHost,
}: {
  status?: CustomPortalStatus | null;
  /** Domínio raiz do Nexus (do server). Ausente → deriva do host atual. */
  rootHost?: string;
}) {
  const suspended = status === "SUSPENDED";
  const heading = suspended
    ? "Plataforma temporariamente indisponível"
    : "Plataforma indisponível";
  const message = suspended
    ? "Esta plataforma de vagas está fora do ar no momento. Tente novamente mais tarde."
    : "Não encontramos uma plataforma de vagas neste endereço.";

  const href = rootHost ? nexusUrlFrom(rootHost, "/") : nexusUrl("/");

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ background: "#ffffff", color: "#0f172a" }}
    >
      <div className="text-4xl font-bold tracking-tight">
        nexus<span style={{ color: "#5457e0" }}>.</span>
      </div>
      <h1 className="text-xl font-semibold">{heading}</h1>
      <p className="max-w-sm text-sm" style={{ color: "#64748b" }}>
        {message}
      </p>
      <a
        href={href}
        className="rounded-md px-4 py-2 text-sm font-semibold text-white"
        style={{ background: "#5457e0" }}
      >
        Ir para o Nexus
      </a>
    </div>
  );
}
