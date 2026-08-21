"use client";

import { X } from "lucide-react";

import { MultiSelectPopover } from "@/components/shared/multi-select-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  contractTypeOptions,
  emptyOpportunityFilters,
  experienceLevelOptions,
  type OpportunityFilters,
} from "@/lib/opportunity-filters";

/**
 * Painel "Filtros de oportunidade" da barra lateral do mapa (mesmos 8 campos
 * de nexus-map.js#applyOpportunityFilters, sempre visíveis — sem o
 * show/hide condicional de contrato/salário-ou-orçamento que
 * pro/opportunities tem). Só filtra marcadores do tipo "oportunidade".
 */
export function OpportunityFilterFields({
  filters,
  onChange,
  skillOptions,
}: {
  filters: OpportunityFilters;
  onChange: (filters: OpportunityFilters) => void;
  skillOptions: { value: string; label: string }[];
}) {
  function set<K extends keyof OpportunityFilters>(
    key: K,
    value: OpportunityFilters[K]
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="space-y-2 border-t pt-3">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Filtros de oportunidade
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs"
          onClick={() => onChange(emptyOpportunityFilters)}
        >
          <X className="size-3" />
          Limpar
        </Button>
      </div>

      <div className="max-h-85 space-y-2 overflow-y-auto pr-1">
        <div className="space-y-1">
          <Label className="text-xs">Buscar</Label>
          <Input
            placeholder="Título ou empresa..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Modalidade</Label>
          <Select
            value={filters.modality || "ALL"}
            onValueChange={(v) => set("modality", v === "ALL" ? "" : v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="REMOTE">Remoto</SelectItem>
              <SelectItem value="ONSITE">Presencial</SelectItem>
              <SelectItem value="HYBRID">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Experiência</Label>
          <MultiSelectPopover
            label="Experiência"
            options={experienceLevelOptions}
            value={filters.expLevels}
            onChange={(v) => set("expLevels", v)}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Data de postagem</Label>
          <Input
            type="date"
            value={filters.postedDate}
            onChange={(e) => set("postedDate", e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Regime de trabalho</Label>
          <Select
            value={filters.projectType || "ALL"}
            onValueChange={(v) => set("projectType", v === "ALL" ? "" : v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="FREELANCE">Freelance</SelectItem>
              <SelectItem value="FULL_TIME">Tempo integral</SelectItem>
              <SelectItem value="PART_TIME">Meio período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {skillOptions.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs">Skills</Label>
            <MultiSelectPopover
              label="Skills"
              options={skillOptions}
              value={filters.skills}
              onChange={(v) => set("skills", v)}
            />
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs">Tipo de contrato</Label>
          <Select
            value={filters.contractType || "ALL"}
            onValueChange={(v) => set("contractType", v === "ALL" ? "" : v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {contractTypeOptions.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Salário mín.</Label>
            <Input
              type="number"
              min={0}
              step={100}
              value={filters.minSalary}
              onChange={(e) => set("minSalary", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Salário máx.</Label>
            <Input
              type="number"
              min={0}
              step={100}
              value={filters.maxSalary}
              onChange={(e) => set("maxSalary", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Orçamento mín.</Label>
            <Input
              type="number"
              min={0}
              step={100}
              value={filters.minBudget}
              onChange={(e) => set("minBudget", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Orçamento máx.</Label>
            <Input
              type="number"
              min={0}
              step={100}
              value={filters.maxBudget}
              onChange={(e) => set("maxBudget", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
