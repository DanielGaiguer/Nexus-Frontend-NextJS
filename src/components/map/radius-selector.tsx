"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RADIUS_OPTIONS = [5, 10, 20, 50, Infinity];

function radiusLabel(r: number) {
  return isFinite(r) ? `${r} km` : "Sem distância";
}

/** Espelha os botões "Distância (km)" da barra lateral do mapa original — filtra TODOS os marcadores (não só oportunidades) por distância até o centro. */
export function RadiusSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (radius: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        Distância (km)
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {RADIUS_OPTIONS.map((r) => (
          <Button
            key={r}
            type="button"
            variant={value === r ? "default" : "outline"}
            size="sm"
            className={cn("h-7 text-xs", !isFinite(r) && "col-span-2")}
            onClick={() => onChange(r)}
          >
            {radiusLabel(r)}
          </Button>
        ))}
      </div>
      <div className="text-muted-foreground text-center text-[11px]">
        {isFinite(value)
          ? `Mostrando raio de ${value} km`
          : "Mostrando todos, sem limite de distância"}
      </div>
    </div>
  );
}
