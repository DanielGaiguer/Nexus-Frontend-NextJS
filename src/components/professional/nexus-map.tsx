"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
const opportunityIcon = pin("#22c55e");

const BRAZIL_CENTER: [number, number] = [-14.2, -51.9];

export function NexusMap({
  professionals,
  companies,
  opportunities,
  visibleTypes,
  companyHref = (id) => `/pro/companies/${id}`,
  professionalHref,
}: {
  professionals: MapProfessionalDTO[];
  companies: MapCompanyDTO[];
  opportunities: MapOpportunityDTO[];
  visibleTypes: Set<MapEntityType>;
  /** Pra onde o "Ver empresa →" do popup aponta — cada papel enxerga empresas num caminho diferente. */
  companyHref?: (id: number) => string;
  /** Se informado, mostra um link "Ver profissional →" no popup (só faz sentido pro lado empresa). */
  professionalHref?: (id: number) => string;
}) {
  return (
    <MapContainer
      center={BRAZIL_CENTER}
      zoom={4}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {visibleTypes.has("professionals") &&
        professionals.map((p) => (
          <Marker
            key={`p-${p.id}`}
            position={[p.latitude, p.longitude]}
            icon={professionalIcon}
          >
            <Popup>
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
            <Popup>
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
                  Ver empresa →
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
            icon={opportunityIcon}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{o.title}</div>
                <div className="text-xs text-slate-500">{o.companyName}</div>
                {o.city && (
                  <div className="text-xs text-slate-500">
                    {o.city}
                    {o.uf ? `, ${o.uf}` : ""}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
