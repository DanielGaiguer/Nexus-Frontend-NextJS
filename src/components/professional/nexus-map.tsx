"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type {
  MapCompanyDTO,
  MapOpportunityDTO,
  MapProfessionalDTO,
} from "@/types/map";

export type MapEntityType = "professionals" | "companies" | "opportunities";

/**
 * Pin em HTML/CSS puro (divIcon) — mesma técnica de nexus-map.js#makePin,
 * evita o problema clássico do Leaflet+bundler de não achar os PNGs padrão
 * de marcador (marker-icon.png etc.) quando importado via npm.
 */
function pin(color: string) {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid rgba(255,255,255,0.85);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const professionalIcon = pin("#6b6eff");
const companyIcon = pin("#f59e0b");
// Espelha a legenda do mapa: projeto (ciano — --nexus-info) e vaga de
// emprego (verde) usam cores de pin diferentes, não uma única cor
// "oportunidade". Projeto era roxo claro (#a78bfa) antes, mas ficava muito
// parecido com o pin de profissional (#6b6eff); trocado pra um tom bem
// distinto dos outros quatro.
const projectIcon = pin("#06b6d4");
const jobIcon = pin("#22c55e");
const youIcon = pin("#ef4444");

// Mesma tradução do translateWorkMode() do nexus-map.js original — usada no
// popup de oportunidade (linha "Cidade, UF · Modalidade").
const modalityLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

const BRAZIL_CENTER: [number, number] = [-14.2, -51.9];

// Mesmos limites do mapa antigo (nexus-map.js): impede dar zoom out até
// sobrar borda branca fora do mundo e, junto com noWrap no TileLayer,
// impede rolar o globo lateralmente ao infinito (o mapa "trava" nas bordas
// em vez de repetir o planeta do lado).
const WORLD_BOUNDS = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));

// Basemap da CARTO acompanhando o tema do site: escuro no tema escuro
// (mesmo provider do mapa antigo), claro no tema claro — mesma fonte,
// mesmo estilo visual, só troca a paleta. Grátis, sem API key.
const TILE_LAYERS = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
} as const;

export function NexusMap({
  professionals,
  companies,
  opportunities,
  visibleTypes,
  companyHref = (id) => `/pro/companies/${id}`,
  professionalHref,
  you,
}: {
  professionals: MapProfessionalDTO[];
  companies: MapCompanyDTO[];
  opportunities: MapOpportunityDTO[];
  visibleTypes: Set<MapEntityType>;
  /** Pra onde o "Ver empresa →" do popup aponta — cada papel enxerga empresas num caminho diferente. */
  companyHref?: (id: number) => string;
  /** Se informado, mostra um link "Ver profissional →" no popup (só faz sentido pro lado empresa). */
  professionalHref?: (id: number) => string;
  /** Sua própria localização — pin vermelho "Você" na legenda do mapa original. */
  you?: { latitude: number; longitude: number };
}) {
  // NexusMap só existe em client (dynamic import com ssr:false lá na
  // página), então nesse ponto o next-themes já resolveu o tema real —
  // sem risco do mismatch de hidratação que faria isso ser undefined em
  // componentes renderizados no servidor.
  const { resolvedTheme } = useTheme();
  const tileLayer =
    resolvedTheme === "light" ? TILE_LAYERS.light : TILE_LAYERS.dark;

  return (
    <MapContainer
      center={BRAZIL_CENTER}
      zoom={4}
      minZoom={2}
      maxBounds={WORLD_BOUNDS}
      maxBoundsViscosity={1.0}
      scrollWheelZoom
      className="h-full w-full"
    >
      {/* Basemap da CARTO acompanhando o tema do site (claro/escuro). */}
      <TileLayer
        key={tileLayer.url}
        attribution={tileLayer.attribution}
        url={tileLayer.url}
        subdomains="abcd"
        maxZoom={19}
        noWrap
      />

      {visibleTypes.has("professionals") &&
        professionals.map((p) => (
          <Marker
            key={`p-${p.id}`}
            position={[p.latitude, p.longitude]}
            icon={professionalIcon}
          >
            <Popup className="nexus-popup">
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{p.name}</div>
                {p.city && (
                  <div className="text-xs text-slate-500">
                    {p.city}
                    {p.uf ? `, ${p.uf}` : ""}
                  </div>
                )}
                {p.skills.length > 0 && (
                  <div className="text-xs text-slate-500">
                    {p.skills.slice(0, 4).join(", ")}
                  </div>
                )}
                {professionalHref && (
                  <Link
                    href={professionalHref(p.id)}
                    className="text-primary text-xs font-medium"
                  >
                    Ver profissional →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

      {visibleTypes.has("companies") &&
        companies.map((c) => (
          <Marker
            key={`c-${c.id}`}
            position={[c.latitude, c.longitude]}
            icon={companyIcon}
          >
            <Popup className="nexus-popup">
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{c.companyName}</div>
                {c.city && (
                  <div className="text-xs text-slate-500">
                    {c.city}
                    {c.uf ? `, ${c.uf}` : ""}
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  {c.openProjects} vaga(s)/projeto(s) aberto(s)
                </div>
                <Link
                  href={companyHref(c.id)}
                  className="text-primary text-xs font-medium"
                >
                  Ver contratante →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

      {visibleTypes.has("opportunities") &&
        opportunities.map((o) => (
          <Marker
            key={`o-${o.id}`}
            position={[o.latitude, o.longitude]}
            icon={o.opportunityType === "JOB" ? jobIcon : projectIcon}
          >
            <Popup className="nexus-popup">
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{o.title}</div>
                <div className="text-xs text-slate-500">{o.companyName}</div>
                {(o.city || o.workMode) && (
                  <div className="text-xs text-slate-500">
                    {o.city}
                    {o.uf ? `, ${o.uf}` : ""}
                    {o.workMode
                      ? ` ${o.city ? "· " : ""}${modalityLabels[o.workMode] ?? o.workMode}`
                      : ""}
                  </div>
                )}
                {o.requiredSkills.length > 0 && (
                  <div className="text-primary text-xs">
                    {o.requiredSkills.slice(0, 3).join(", ")}
                    {o.requiredSkills.length > 3
                      ? ` +${o.requiredSkills.length - 3} mais`
                      : ""}
                  </div>
                )}
                <Link
                  href={`/public/opportunity/${o.id}`}
                  className="text-primary text-xs font-medium"
                >
                  Ver oportunidade →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

      {you && (
        <Marker position={[you.latitude, you.longitude]} icon={youIcon}>
          <Popup className="nexus-popup">
            <div className="text-sm font-semibold">Você</div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
