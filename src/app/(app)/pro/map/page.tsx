"use client";

import { Briefcase, Building2, Layers, Search, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { OpportunityFilterFields } from "@/components/map/opportunity-filter-fields";
import { RadiusSelector } from "@/components/map/radius-selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapEntityType } from "@/components/professional/nexus-map";
import {
  useMapCompanies,
  useMapOpportunities,
  useMapProfessionals,
} from "@/hooks/queries/useMapData";
import { useProfessionalProfile } from "@/hooks/queries/useProfessionalProfile";
import { useSkillCatalog } from "@/hooks/queries/useSkillCatalog";
import { DEFAULT_MAP_CENTER, distanceKm } from "@/lib/geo";
import {
  emptyOpportunityFilters,
  matchesOpportunityFilters,
} from "@/lib/opportunity-filters";
import { cn } from "@/lib/utils";

const legendItems = [
  { color: "bg-primary", label: "Profissional" },
  { color: "bg-warning", label: "Empresa" },
  { color: "bg-info", label: "Projeto" },
  { color: "bg-success", label: "Vaga de emprego" },
  { color: "bg-destructive", label: "Você" },
];

// Leaflet toca `window`/`document` na inicialização — só pode existir no
// client, nunca durante o SSR do Next.
const NexusMap = dynamic(
  () => import("@/components/professional/nexus-map").then((m) => m.NexusMap),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> }
);

const typeOptions: {
  value: "all" | MapEntityType;
  label: string;
  icon: typeof Layers;
  dot: string;
}[] = [
  {
    value: "all",
    label: "Todos",
    icon: Layers,
    dot: "bg-gradient-to-br from-primary to-accent",
  },
  {
    value: "professionals",
    label: "Profissionais",
    icon: Users,
    dot: "bg-primary",
  },
  { value: "companies", label: "Empresas", icon: Building2, dot: "bg-warning" },
  {
    value: "opportunities",
    label: "Oportunidades",
    icon: Briefcase,
    dot: "bg-success",
  },
];

export default function ProMapPage() {
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState("");
  const [selected, setSelected] = useState<"all" | MapEntityType>("all");
  const [radius, setRadius] = useState(50);
  const [oppType, setOppType] = useState<"" | "PROJECT" | "JOB">("");
  const [oppFilters, setOppFilters] = useState(emptyOpportunityFilters);

  const professionals = useMapProfessionals({ city });
  const companies = useMapCompanies({ city });
  const opportunities = useMapOpportunities({ city });
  const { data: profile } = useProfessionalProfile();
  const { data: skillCatalog } = useSkillCatalog();

  const you =
    profile?.latitude != null && profile?.longitude != null
      ? { latitude: profile.latitude, longitude: profile.longitude }
      : undefined;
  const center = you
    ? { lat: you.latitude, lng: you.longitude }
    : DEFAULT_MAP_CENTER;

  const visibleTypes = useMemo<Set<MapEntityType>>(() => {
    if (selected === "all")
      return new Set(["professionals", "companies", "opportunities"]);
    return new Set([selected]);
  }, [selected]);

  const filteredProfessionals = useMemo(
    () =>
      (professionals.data ?? []).filter(
        (p) =>
          distanceKm(center.lat, center.lng, p.latitude, p.longitude) <= radius
      ),
    [professionals.data, center.lat, center.lng, radius]
  );
  const filteredCompanies = useMemo(
    () =>
      (companies.data ?? []).filter(
        (c) =>
          distanceKm(center.lat, center.lng, c.latitude, c.longitude) <= radius
      ),
    [companies.data, center.lat, center.lng, radius]
  );
  const filteredOpportunities = useMemo(
    () =>
      (opportunities.data ?? []).filter(
        (o) =>
          distanceKm(center.lat, center.lng, o.latitude, o.longitude) <=
            radius &&
          (!oppType || o.opportunityType === oppType) &&
          matchesOpportunityFilters(o, oppFilters)
      ),
    [opportunities.data, center.lat, center.lng, radius, oppType, oppFilters]
  );

  const counts = {
    all:
      filteredProfessionals.length +
      filteredCompanies.length +
      filteredOpportunities.length,
    professionals: filteredProfessionals.length,
    companies: filteredCompanies.length,
    opportunities: filteredOpportunities.length,
  };

  const isLoading =
    professionals.isLoading || companies.isLoading || opportunities.isLoading;

  const visibleCount =
    (visibleTypes.has("professionals") ? filteredProfessionals.length : 0) +
    (visibleTypes.has("companies") ? filteredCompanies.length : 0) +
    (visibleTypes.has("opportunities") ? filteredOpportunities.length : 0);

  const skillOptions = (skillCatalog ?? []).map((s) => ({
    value: s.name,
    label: s.name,
  }));

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-6xl flex-col gap-4 sm:flex-row">
      <aside className="scrollbar-hide flex w-full shrink-0 flex-col gap-4 overflow-y-auto sm:w-72">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Mapa de Talentos</h1>
          <p className="text-muted-foreground text-xs">
            Explore profissionais, empresas e oportunidades
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCity(cityInput.trim());
          }}
          className="space-y-1"
        >
          <Label className="text-xs">Cidade</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar por cidade..."
              className="pl-9"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
          </div>
        </form>

        <div className="space-y-1">
          <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Tipo
          </div>
          {typeOptions.map(({ value, label, dot }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                selected === value ? "bg-accent" : "hover:bg-accent/50"
              )}
            >
              <span className={cn("size-2.5 shrink-0 rounded-full", dot)} />
              <span className="flex-1 text-left">{label}</span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {counts[value]}
              </span>
            </button>
          ))}

          {selected === "opportunities" && (
            <div className="bg-primary/5 border-primary/15 ml-4 space-y-1 rounded-md border p-2">
              <div className="text-primary text-[11px] font-bold tracking-wide uppercase">
                Tipo de oportunidade
              </div>
              {[
                {
                  value: "",
                  label: "Todos",
                  dot: "bg-gradient-to-br from-info to-success",
                },
                { value: "PROJECT", label: "Projetos", dot: "bg-info" },
                { value: "JOB", label: "Vagas de emprego", dot: "bg-success" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOppType(opt.value as typeof oppType)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-xs",
                    oppType === opt.value
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn("size-2 shrink-0 rounded-full", opt.dot)}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <RadiusSelector value={radius} onChange={setRadius} />

        <OpportunityFilterFields
          filters={oppFilters}
          onChange={setOppFilters}
          skillOptions={skillOptions}
        />

        <div className="mt-auto space-y-2 border-t pt-3">
          <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Legenda
          </div>
          <div className="space-y-1.5">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className={cn("size-3 shrink-0 rounded-full", item.color)}
                />
                <span className="text-muted-foreground text-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground text-xs">
            {visibleCount} resultado(s) visível(is)
          </div>
        </div>
      </aside>

      <div className="min-h-[400px] flex-1 overflow-hidden rounded-lg border">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <NexusMap
            professionals={filteredProfessionals}
            companies={filteredCompanies}
            opportunities={filteredOpportunities}
            visibleTypes={visibleTypes}
            you={you}
          />
        )}
      </div>
    </div>
  );
}
