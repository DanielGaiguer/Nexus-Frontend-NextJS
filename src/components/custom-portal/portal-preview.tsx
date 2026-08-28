"use client";

import { Globe } from "lucide-react";

import {
  PortalBrandingView,
  resolvePortalColor,
} from "@/components/custom-portal/portal-branding-view";
import type { CustomPortalStatus } from "@/types/custom-portal";

export interface PortalPreviewData {
  displayName: string;
  primaryColor: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  faviconUrl: string | null;
  aboutText: string;
  sections: { title: string; content: string }[];
  companyName: string;
  subdomain: string;
  status: CustomPortalStatus;
}

const MUTED = "#64748b";
const SURFACE = "#f1f5f9";

/**
 * Prévia do editor (Prompt 2). Só uma moldura de "navegador" em volta do
 * mesmo PortalBrandingView que a página pública real usa (Prompt 3) — o que a
 * empresa vê aqui é exatamente o que sai publicado.
 */
export function PortalPreview({ data }: { data: PortalPreviewData }) {
  const color = resolvePortalColor(data.primaryColor);
  const inactive = data.status !== "ACTIVE";

  return (
    <div
      className="overflow-hidden rounded-xl border shadow-sm"
      style={{ background: "#ffffff", color: "#0f172a" }}
    >
      <div
        className="flex items-center gap-2 border-b px-3 py-2"
        style={{ background: SURFACE, borderColor: "#e2e8f0" }}
      >
        <span className="flex gap-1">
          <span
            className="size-2 rounded-full"
            style={{ background: "#f87171" }}
          />
          <span
            className="size-2 rounded-full"
            style={{ background: "#fbbf24" }}
          />
          <span
            className="size-2 rounded-full"
            style={{ background: "#34d399" }}
          />
        </span>
        <span
          className="flex items-center gap-1.5 rounded px-2 py-0.5 text-xs"
          style={{ background: "#ffffff", color: MUTED }}
        >
          {data.faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL remota do Supabase, sem next/image
            <img
              src={data.faviconUrl}
              alt=""
              className="size-3.5 rounded-[3px] object-cover"
            />
          ) : (
            <Globe className="size-3.5" />
          )}
          {data.subdomain || "sua-empresa"}.nexus.com.br
        </span>
      </div>

      {inactive && (
        <div
          className="px-4 py-1.5 text-center text-xs font-medium"
          style={{ background: "#fef3c7", color: "#92400e" }}
        >
          Prévia — a publicação depende da assinatura ativa.
        </div>
      )}

      <PortalBrandingView
        dense
        jobsAnchor="preview-vagas"
        branding={{
          displayName: data.displayName,
          primaryColor: data.primaryColor,
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          aboutText: data.aboutText,
          sections: data.sections,
          companyName: data.companyName,
        }}
      >
        <section id="preview-vagas">
          <h2 className="text-sm font-bold" style={{ color }}>
            Vagas abertas
          </h2>
          <div className="mt-2 space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                style={{ borderColor: "#e2e8f0", color: MUTED }}
              >
                <span>Oportunidade de exemplo #{i + 1}</span>
                <span
                  className="rounded px-2 py-0.5"
                  style={{ background: `${color}18`, color }}
                >
                  Ver
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs" style={{ color: MUTED }}>
            As oportunidades reais da empresa entram aqui na página publicada.
          </p>
        </section>
      </PortalBrandingView>
    </div>
  );
}
