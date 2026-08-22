"use client";

import { FolderX, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { OpportunityFeedCard } from "@/components/company/opportunity-feed-card";
import { EmptyState } from "@/components/shared/empty-state";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyOpportunities } from "@/hooks/queries/useCompanyOpportunities";
import { useSkillCatalog } from "@/hooks/queries/useSkillCatalog";
import {
  contractTypeOptions,
  emptyOpportunityFilters,
  experienceLevelOptions,
  matchesOpportunityFilters,
} from "@/lib/opportunity-filters";

/**
 * Espelha company-opportunities.html — "Oportunidades da plataforma": vitrine
 * somente leitura de todas as oportunidades abertas publicadas por outras
 * empresas (mercado/concorrência). Mesmos 8 filtros de pro/opportunities e
 * admin/projects; sem score (não há compatibilidade empresa-empresa) e sem
 * "demonstrar interesse" — só "ver detalhes" e "ver empresa".
 */
export default function CompanyOpportunitiesPage() {
  const { data: opportunities, isLoading } = useCompanyOpportunities();
  const { data: skillCatalog } = useSkillCatalog();
  const [search, setSearch] = useState("");
  const [oppType, setOppType] = useState<"" | "PROJECT" | "JOB">("");
  const [oppFilters, setOppFilters] = useState(emptyOpportunityFilters);

  function clearFilters() {
    setSearch("");
    setOppType("");
    setOppFilters(emptyOpportunityFilters);
  }

  const filtered = useMemo(() => {
    if (!opportunities) return [];
    return opportunities.filter(
      (project) =>
        (!oppType || project.opportunityType === oppType) &&
        matchesOpportunityFilters(project, { ...oppFilters, search })
    );
  }, [opportunities, oppType, oppFilters, search]);

  const skillOptions = (skillCatalog ?? []).map((s) => ({
    value: s.name,
    label: s.name,
  }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Oportunidades da plataforma
        </h1>
        <p className="text-muted-foreground text-sm">
          {opportunities?.length ?? 0} oportunidades publicadas por outras
          empresas
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Buscar
            </Label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Título ou empresa..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Oportunidade
            </Label>
            <Select
              value={oppType || "ALL"}
              onValueChange={(v) => {
                const next = v === "ALL" ? "" : (v as "PROJECT" | "JOB");
                setOppType(next);
                setOppFilters((f) => ({
                  ...f,
                  contractType: "",
                  minSalary: "",
                  maxSalary: "",
                  minBudget: "",
                  maxBudget: "",
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="PROJECT">Projetos</SelectItem>
                <SelectItem value="JOB">Vagas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Modalidade
            </Label>
            <Select
              value={oppFilters.modality || "ALL"}
              onValueChange={(v) =>
                setOppFilters((f) => ({ ...f, modality: v === "ALL" ? "" : v }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="REMOTE">Remoto</SelectItem>
                <SelectItem value="ONSITE">Presencial</SelectItem>
                <SelectItem value="HYBRID">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Experiência
            </Label>
            <MultiSelectPopover
              label="Experiência"
              options={experienceLevelOptions}
              value={oppFilters.expLevels}
              onChange={(v) => setOppFilters((f) => ({ ...f, expLevels: v }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Data de postagem
            </Label>
            <Input
              type="date"
              value={oppFilters.postedDate}
              onChange={(e) =>
                setOppFilters((f) => ({ ...f, postedDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Regime de trabalho
            </Label>
            <Select
              value={oppFilters.projectType || "ALL"}
              onValueChange={(v) =>
                setOppFilters((f) => ({
                  ...f,
                  projectType: v === "ALL" ? "" : v,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="FREELANCE">Freelance</SelectItem>
                <SelectItem value="FULL_TIME">Tempo integral</SelectItem>
                <SelectItem value="PART_TIME">Meio período</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Skills
            </Label>
            <MultiSelectPopover
              label="Skills"
              options={skillOptions}
              value={oppFilters.skills}
              onChange={(v) => setOppFilters((f) => ({ ...f, skills: v }))}
            />
          </div>
        </div>

        {oppType === "JOB" && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Tipo de contrato
              </Label>
              <Select
                value={oppFilters.contractType || "ALL"}
                onValueChange={(v) =>
                  setOppFilters((f) => ({
                    ...f,
                    contractType: v === "ALL" ? "" : v,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
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
            {(oppFilters.contractType === "CLT" ||
              oppFilters.contractType === "PJ") && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Salário mín. (R$/mês)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    value={oppFilters.minSalary}
                    onChange={(e) =>
                      setOppFilters((f) => ({
                        ...f,
                        minSalary: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Salário máx. (R$/mês)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    value={oppFilters.maxSalary}
                    onChange={(e) =>
                      setOppFilters((f) => ({
                        ...f,
                        maxSalary: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}

        {oppType === "PROJECT" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Orçamento mín. (R$)
              </Label>
              <Input
                type="number"
                min={0}
                step={100}
                value={oppFilters.minBudget}
                onChange={(e) =>
                  setOppFilters((f) => ({ ...f, minBudget: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Orçamento máx. (R$)
              </Label>
              <Input
                type="number"
                min={0}
                step={100}
                value={oppFilters.maxBudget}
                onChange={(e) =>
                  setOppFilters((f) => ({ ...f, maxBudget: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            <X className="size-4" />
            Limpar
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        Exibindo{" "}
        <span className="text-foreground font-semibold">{filtered.length}</span>{" "}
        de {opportunities?.length ?? 0} oportunidades
      </p>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      )}

      {!isLoading && opportunities?.length === 0 && (
        <EmptyState
          icon={FolderX}
          title="Nenhuma oportunidade na plataforma"
          description="As oportunidades publicadas pelas empresas aparecerão aqui."
        />
      )}

      {!isLoading &&
        opportunities &&
        opportunities.length > 0 &&
        filtered.length === 0 && (
          <EmptyState
            icon={Search}
            title="Lamentamos, não encontramos nenhuma oportunidade com esses filtros"
            action={
              <Button variant="ghost" onClick={clearFilters}>
                <X className="size-4" />
                Limpar filtros
              </Button>
            }
          />
        )}

      <div className="flex flex-col gap-3">
        {filtered.map((project) => (
          <OpportunityFeedCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
