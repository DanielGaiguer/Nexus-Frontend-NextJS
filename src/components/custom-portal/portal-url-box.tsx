"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { portalHost, portalUrl } from "@/lib/portal-domain";

/**
 * Endereço publicado da plataforma personalizada, com copiar e abrir. Usado na
 * área "Minha Plataforma" do contratante.
 */
export function PortalUrlBox({
  subdomain,
  active,
}: {
  subdomain: string;
  active: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const host = portalHost(subdomain);
  const url = portalUrl(subdomain);

  async function copy() {
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
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-muted min-w-0 flex-1 truncate rounded-md px-3 py-2 font-mono text-sm hover:underline"
        >
          {host}
        </a>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          Copiar
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
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
