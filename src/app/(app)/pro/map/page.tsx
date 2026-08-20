"use client";

import { Briefcase, Building2, Layers, Search, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapEntityType } from "@/components/professional/nexus-map";
import {
  useMapCompanies,
  useMapOpportunities,
  useMapProfessionals,
} from "@/hooks/queries/useMapData";
import { cn } from "@/lib/utils";

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

  const professionals = useMapProfessionals({ city });
  const companies = useMapCompanies({ city });
  const opportunities = useMapOpportunities({ city });

  const visibleTypes = useMemo<Set<MapEntityType>>(() => {
    if (selected === "all")
      return new Set(["professionals", "companies", "opportunities"]);
    return new Set([selected]);
  }, [selected]);

  const counts = {
    all:
      (professionals.data?.length ?? 0) +
      (companies.data?.length ?? 0) +
      (opportunities.data?.length ?? 0),
    professionals: professionals.data?.length ?? 0,
    companies: companies.data?.length ?? 0,
    opportunities: opportunities.data?.length ?? 0,
  };

  const isLoading =
    professionals.isLoading || companies.isLoading || opportunities.isLoading;

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-6xl flex-col gap-4 sm:flex-row">
      <aside className="flex w-full shrink-0 flex-col gap-4 sm:w-64">
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
          className="relative"
        >
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por cidade..."
            className="pl-9"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
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
        </div>
      </aside>

      <div className="min-h-[400px] flex-1 overflow-hidden rounded-lg border">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <NexusMap
            professionals={professionals.data ?? []}
            companies={companies.data ?? []}
            opportunities={opportunities.data ?? []}
            visibleTypes={visibleTypes}
          />
        )}
      </div>
    </div>
  );
}
