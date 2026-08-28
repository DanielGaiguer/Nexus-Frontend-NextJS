"use client";

import type { ReactNode } from "react";

export interface PortalBranding {
  displayName: string | null;
  primaryColor: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  aboutText: string | null;
  sections: { title: string; content: string | null }[];
  companyName: string;
}

const DEFAULT_COLOR = "#5457e0";
const INK = "#0f172a";
const BODY = "#334155";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const SURFACE = "#f1f5f9";

/** Cor primária válida (#rrggbb) ou o fallback da marca Nexus. */
export function resolvePortalColor(color: string | null | undefined): string {
  return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : DEFAULT_COLOR;
}

/**
 * Scaffolding visual da plataforma personalizada (banner, logo, nome, "Sobre",
 * seções extras) — compartilhado entre a PÁGINA PÚBLICA real
 * (`empresa.nexus.com.br`, Prompt 3) e a PRÉVIA do editor (Prompt 2), pra as
 * duas ficarem idênticas. Cores próprias sempre inline; nunca tokens do tema do
 * Nexus, e superfície branca fixa (não herda o dark do admin).
 * `children` é o miolo: a lista de vagas (home) ou o detalhe da vaga.
 */
export function PortalBrandingView({
  branding,
  children,
  header,
  dense = false,
  jobsAnchor,
}: {
  branding: PortalBranding;
  children?: ReactNode;
  /** Barra fixa no topo (PortalHeader). */
  header?: ReactNode;
  /** compacta paddings/altura — usado na prévia do editor */
  dense?: boolean;
  /** id de âncora pra um CTA "ver vagas" (só a home passa) */
  jobsAnchor?: string;
}) {
  const color = resolvePortalColor(branding.primaryColor);
  const title = (branding.displayName ?? "").trim() || branding.companyName;
  const about = (branding.aboutText ?? "").trim();
  const sections = branding.sections.filter(
    (s) => (s.title ?? "").trim() || (s.content ?? "").trim()
  );

  return (
    <div style={{ background: "#ffffff", color: INK }}>
      {header}
      <div
        className={`w-full ${dense ? "h-28" : "h-40 sm:h-56"}`}
        style={{ background: SURFACE }}
      >
        {branding.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL remota do Supabase, sem next/image
          <img
            src={branding.bannerUrl}
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

      <div className={`mx-auto max-w-4xl px-4 ${dense ? "pb-5" : "pb-12"}`}>
        <div className={`flex items-end gap-4 ${dense ? "-mt-8" : "-mt-12"}`}>
          <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 font-bold ${
              dense ? "size-16 text-xl" : "size-24 text-3xl"
            }`}
            style={{ background: "#ffffff", borderColor: "#ffffff", color }}
          >
            {branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL remota do Supabase, sem next/image
              <img
                src={branding.logoUrl}
                alt=""
                className="size-full object-contain"
              />
            ) : (
              title.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 pb-1">
            <h1
              className={`truncate font-bold tracking-tight ${
                dense ? "text-lg" : "text-2xl sm:text-3xl"
              }`}
            >
              {title}
            </h1>
            <p className="text-sm" style={{ color: MUTED }}>
              {branding.companyName}
            </p>
          </div>
        </div>

        {jobsAnchor && (
          <a
            href={`#${jobsAnchor}`}
            className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ background: color, color: "#ffffff" }}
          >
            Ver vagas abertas
          </a>
        )}

        {about && (
          <section className={dense ? "mt-5" : "mt-10"}>
            <h2
              className={`font-bold ${dense ? "text-sm" : "text-lg"}`}
              style={{ color }}
            >
              Sobre
            </h2>
            <p
              className={`mt-1.5 whitespace-pre-line ${
                dense ? "text-sm" : "text-[15px] leading-relaxed"
              }`}
              style={{ color: BODY }}
            >
              {about}
            </p>
          </section>
        )}

        {sections.length > 0 && (
          <div className={`${dense ? "mt-4 space-y-4" : "mt-8 space-y-6"}`}>
            {sections.map((section, i) => (
              <section
                key={i}
                className="pl-4"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <h3
                  className={`font-semibold ${dense ? "text-sm" : "text-base"}`}
                >
                  {section.title?.trim() || "Sem título"}
                </h3>
                {(section.content ?? "").trim() && (
                  <p
                    className={`mt-1 whitespace-pre-line ${
                      dense ? "text-sm" : "text-[15px] leading-relaxed"
                    }`}
                    style={{ color: BODY }}
                  >
                    {section.content}
                  </p>
                )}
              </section>
            ))}
          </div>
        )}

        {children && <div className={dense ? "mt-6" : "mt-12"}>{children}</div>}

        <div
          className={`${dense ? "mt-6" : "mt-16"} border-t pt-4 text-center text-xs`}
          style={{ borderColor: BORDER, color: MUTED }}
        >
          Powered by Nexus
        </div>
      </div>
    </div>
  );
}
