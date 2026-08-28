"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { portalHostFrom, portalUrlFrom } from "@/lib/portal-domain";

// host não muda durante a vida da página — subscribe é no-op.
const subscribe = () => () => {};

/**
 * Endereço publicado da plataforma personalizada, com copiar e abrir. Usado na
 * área "Minha Plataforma" do contratante e no painel Admin — telas onde o host
 * atual já é o domínio raiz do Nexus, então dá pra derivar dele.
 * `useSyncExternalStore` resolve o host client-side sem hydration mismatch.
 */
export function PortalUrlBox({
  subdomain,
  active,
}: {
  subdomain: string;
  active: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const currentHost = useSyncExternalStore(
    subscribe,
    () => window.location.host,
    () => ""
  );
  const rootHost = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || currentHost;

  const ready = rootHost !== "";
  const host = ready ? portalHostFrom(rootHost, subdomain) : `${subdomain}.…`;
  const url = ready ? portalUrlFrom(rootHost, subdomain) : "";

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente o endereço.");
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="text-muted-foreground text-xs font-medium uppercase">
        Endereço
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-muted min-w-0 flex-1 truncate rounded-md px-3 py-2 font-mono text-sm hover:underline"
        >
          {host}
        </a>
        <Button variant="outline" size="sm" onClick={copy} disabled={!ready}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          Copiar
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={url || undefined} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            Abrir
          </a>
        </Button>
      </div>
      {!active && (
        <p className="text-muted-foreground text-xs">
          A página só fica no ar enquanto a plataforma está ativa.
        </p>
      )}
    </div>
  );
}
