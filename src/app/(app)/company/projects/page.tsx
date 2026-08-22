"use client";

import {
  Check,
  ChevronsUpDown,
  FolderOpen,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PausedProjectDialog } from "@/components/company/paused-project-dialog";
import { ProjectCard } from "@/components/company/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyProjects } from "@/hooks/queries/useMyProjects";
import { useProjectSkillCatalog } from "@/hooks/queries/useProjectSkillCatalog";
import type { ExperienceLevel } from "@/types/professional";
import type { ProjectStatus } from "@/types/project";

const tabs: { value: "ALL" | ProjectStatus | "CANCELLED"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "OPEN", label: "Aberto" },
  { value: "PAUSED", label: "Pausado" },
  { value: "CLOSED", label: "Encerrado" },
  { value: "CANCELLED", label: "Cancelado" },
];

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "TRAINEE", label: "Trainee" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
];

const contractTypes = [
  { value: "CLT", label: "CLT" },
  { value: "PJ", label: "PJ" },
  { value: "FREELANCER", label: "Freelancer" },
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "TEMPORARY", label: "Temporário" },
];

export default function ProjectsPage() {
  const { data: projects, isLoading } = useMyProjects();
  const { data: skillCatalog } = useProjectSkillCatalog();
  const [status, setStatus] = useState<"ALL" | ProjectStatus | "CANCELLED">(
    "ALL"
  );
  const [search, setSearch] = useState("");
  const [modality, setModality] = useState("");
  const [opportunityType, setOpportunityType] = useState<
    "" | "JOB" | "PROJECT"
  >("");
  const [contractType, setContractType] = useState("");
  const [postedDate, setPostedDate] = useState("");
  const [workType, setWorkType] = useState("");
  const [expLevels, setExpLevels] = useState<string[]>([]);
  const [skillNames, setSkillNames] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  function clearFilters() {
    setSearch("");
    setModality("");
    setOpportunityType("");
    setContractType("");
    setPostedDate("");
    setWorkType("");
    setExpLevels([]);
    setSkillNames([]);
    setMinBudget("");
    setMaxBudget("");
    setMinSalary("");
    setMaxSalary("");
    setStatus("ALL");
  }

  const filtered = useMemo(() => {
    if (!projects) return [];
    const term = search.trim().toLowerCase();
    const min = parseFloat(minBudget) || 0;
    const max = parseFloat(maxBudget) || Infinity;
    const minSal = parseFloat(minSalary) || 0;
    const maxSal = parseFloat(maxSalary) || Infinity;

    return projects.filter((project) => {
      const statusMatch = status === "ALL" || project.status === status;
      const modalityMatch = !modality || project.workMode === modality;
      const typeMatch =
        !opportunityType || project.opportunityType === opportunityType;
      const searchMatch = !term || project.title.toLowerCase().includes(term);
      const contractMatch =
        !contractType || project.contractType === contractType;
      const expMatch =
        expLevels.length === 0 ||
        (project.experienceLevel != null &&
          expLevels.includes(project.experienceLevel));
      const postedMatch =
        !postedDate || project.createdAt.slice(0, 10) === postedDate;
      const workTypeMatch = !workType || project.type === workType;
      const skillsMatch = skillNames.every((name) =>
        project.requiredSkills.some(
          (skill) => skill.name.toLowerCase() === name.toLowerCase()
        )
      );

      let budgetMatch = true;
      if (opportunityType === "PROJECT") {
        budgetMatch =
          (project.maximumBudget ?? Infinity) >= min &&
          (project.minimumBudget ?? 0) <= max;
      }

      let salaryMatch = true;
      if (
        opportunityType === "JOB" &&
        (contractType === "CLT" || contractType === "PJ")
      ) {
        salaryMatch =
          (project.monthlySalaryMax ?? Infinity) >= minSal &&
          (project.monthlySalaryMin ?? 0) <= maxSal;
      }

      return (
        statusMatch &&
        modalityMatch &&
        typeMatch &&
        searchMatch &&
        contractMatch &&
        expMatch &&
        postedMatch &&
        workTypeMatch &&
        skillsMatch &&
        budgetMatch &&
        salaryMatch
      );
    });
  }, [
    projects,
    status,
    modality,
    opportunityType,
    search,
    contractType,
    expLevels,
    postedDate,
    workType,
    skillNames,
    minBudget,
    maxBudget,
    minSalary,
    maxSalary,
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <PausedProjectDialog projects={projects} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Projetos</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie seus projetos e veja os rankings de profissionais
          </p>
        </div>
        <Button asChild>
          <Link href="/company/projects/new">
            <Plus className="size-4" />
            Novo projeto
          </Link>
        </Button>
      </div>

      <div className="bg-info/10 text-foreground rounded-md p-3 text-sm">
        Ao criar um projeto, o ranking de profissionais compatíveis é gerado
        automaticamente. Ao editar, os scores em aberto são recalculados.
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar por título..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={modality || "ALL"}
            onValueChange={(v) => setModality(v === "ALL" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Modalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="REMOTE">Remoto</SelectItem>
              <SelectItem value="ONSITE">Presencial</SelectItem>
              <SelectItem value="HYBRID">Híbrido</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={opportunityType || "ALL"}
            onValueChange={(v) => {
              const next = v === "ALL" ? "" : (v as "JOB" | "PROJECT");
              setOpportunityType(next);
              setContractType("");
              setMinBudget("");
              setMaxBudget("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Oportunidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="PROJECT">Projeto</SelectItem>
              <SelectItem value="JOB">Vaga</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MultiSelectPopover
            label="Experiência"
            options={experienceLevels}
            value={expLevels}
            onChange={setExpLevels}
          />
          <Input
            type="date"
            value={postedDate}
            onChange={(e) => setPostedDate(e.target.value)}
          />
          <Select
            value={workType || "ALL"}
            onValueChange={(v) => setWorkType(v === "ALL" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Regime de trabalho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="FREELANCE">Freelance</SelectItem>
              <SelectItem value="FULL_TIME">Tempo integral</SelectItem>
              <SelectItem value="PART_TIME">Meio período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <MultiSelectPopover
          label="Skills"
          options={(skillCatalog ?? []).map((s) => ({
            value: s.name,
            label: s.name,
          }))}
          value={skillNames}
          onChange={setSkillNames}
        />

        {opportunityType === "JOB" && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              value={contractType || "ALL"}
              onValueChange={(v) => setContractType(v === "ALL" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {contractTypes.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(contractType === "CLT" || contractType === "PJ") && (
              <>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  placeholder="Salário mín. (R$/mês)"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                />
                <Input
                  type="number"
                  min={0}
                  step={100}
                  placeholder="Salário máx. (R$/mês)"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                />
              </>
            )}
          </div>
        )}

        {opportunityType === "PROJECT" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="number"
              min={0}
              step={100}
              placeholder="Orçamento mín. (R$)"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
            />
            <Input
              type="number"
              min={0}
              step={100}
              placeholder="Orçamento máx. (R$)"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-end"
          onClick={clearFilters}
        >
          <X className="size-4" />
          Limpar
        </Button>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={status} className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : !projects || projects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Nenhum projeto publicado"
              description="Crie seu primeiro projeto e encontre os profissionais certos para ele."
              action={
                <Button asChild size="sm">
                  <Link href="/company/projects/new">
                    Criar meu primeiro projeto
                  </Link>
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhum projeto encontrado com esses filtros"
            />
          ) : (
            filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MultiSelectPopover({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between font-normal"
        >
          <span className="truncate">
            {value.length > 0 ? `${label} (${value.length})` : label}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandList>
            <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                  >
                    <Check
                      className={
                        isSelected
                          ? "mr-2 size-4 opacity-100"
                          : "mr-2 size-4 opacity-0"
                      }
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1 border-t p-2">
            {value.map((v) => (
              <Badge key={v} variant="secondary" className="text-[11px]">
                {options.find((o) => o.value === v)?.label ?? v}
              </Badge>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
