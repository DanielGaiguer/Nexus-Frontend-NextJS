"use client";

import { Globe } from "lucide-react";

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

const DEFAULT_COLOR = "#5457e0";
const INK = "#0f172a";
const MUTED = "#64748b";
const SURFACE = "#f1f5f9";

/**
 * Prévia isolada da página pública da plataforma personalizada. Cores próprias
 * inline (nunca tokens do tema do Nexus) e superfície branca fixa — assim o
 * preview representa a página pública (Prompt 3) independentemente do tema
 * claro/escuro do admin.
 */
export function PortalPreview({ data }: { data: PortalPreviewData }) {
  const color = /^#[0-9a-fA-F]{6}$/.test(data.primaryColor)
    ? data.primaryColor
    : DEFAULT_COLOR;
  const title = data.displayName.trim() || data.companyName;
  const inactive = data.status !== "ACTIVE";
  const sections = data.sections.filter(
    (s) => s.title.trim() || s.content.trim()
  );

  return (
    <div
      className="overflow-hidden rounded-xl border shadow-sm"
      style={{ background: "#ffffff", color: INK }}
    >
      {/* barra do "navegador" */}
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

      {/* banner */}
      <div className="relative h-28 w-full" style={{ background: SURFACE }}>
        {data.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL remota do Supabase, sem next/image
          <img
            src={data.bannerUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(120deg, ${color}, ${color}22)`,
            }}
          />
        )}
      </div>

      <div className="px-5 pb-5">
        {/* logo + nome */}
        <div className="-mt-8 flex items-end gap-3">
          <div
            className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 text-xl font-bold"
            style={{ background: "#ffffff", borderColor: "#ffffff", color }}
          >
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL remota do Supabase, sem next/image
              <img
                src={data.logoUrl}
                alt=""
                className="size-full object-contain"
              />
            ) : (
              title.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 pb-1">
            <div className="truncate text-lg font-bold">{title}</div>
            <div className="text-xs" style={{ color: MUTED }}>
              {data.companyName}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="mt-4 rounded-md px-4 py-2 text-sm font-semibold"
          style={{ background: color, color: "#ffffff" }}
        >
          Ver vagas abertas
        </button>

        {data.aboutText.trim() && (
          <section className="mt-5">
            <h2 className="text-sm font-bold" style={{ color }}>
              Sobre
            </h2>
            <p
              className="mt-1 text-sm whitespace-pre-line"
              style={{ color: "#334155" }}
            >
              {data.aboutText}
            </p>
          </section>
        )}

        {sections.map((s, i) => (
          <section
            key={i}
            className="mt-4 pl-3"
            style={{ borderLeft: `3px solid ${color}` }}
          >
            <h3 className="text-sm font-semibold">{s.title || "Sem título"}</h3>
            {s.content.trim() && (
              <p
                className="mt-0.5 text-sm whitespace-pre-line"
                style={{ color: "#334155" }}
              >
                {s.content}
              </p>
            )}
          </section>
        ))}

        <section className="mt-6">
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
            As oportunidades reais da empresa entram aqui na próxima etapa.
          </p>
        </section>

        <div
          className="mt-6 border-t pt-3 text-center text-xs"
          style={{ borderColor: "#e2e8f0", color: MUTED }}
        >
          Powered by Nexus
        </div>
      </div>
    </div>
  );
}
