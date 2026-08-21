"use client";

import {
  Check,
  ChevronsUpDown,
  Eye,
  Handshake,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { MatchCard } from "@/components/professional/match-card";
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
import { useShowInterest } from "@/hooks/mutations/useShowInterest";
import { useOpportunities } from "@/hooks/queries/useOpportunities";
import { useProfessionalProfile } from "@/hooks/queries/useProfessionalProfile";
import { useSkillCatalog } from "@/hooks/queries/useSkillCatalog";
import { ApiError } from "@/lib/api-client";
import type { ExperienceLevel } from "@/types/professional";

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

/** Espelha missingScoreRelevantFields() do ProfessionalController antigo —
 * mesmos campos que pesam no cálculo de score (skills, pretensão salarial
 * do(s) regime(s) escolhido(s) e localização), não é a checagem de "perfil
 * completo" usada em /pro/profile. */
function missingScoreRelevantFields(
  profile: ReturnType<typeof useProfessionalProfile>["data"]
) {
  if (!profile) return true;
  const noSkills = !profile.skills || profile.skills.length === 0;
  const noLocation = profile.latitude == null || profile.longitude == null;
  const types = profile.preferredOpportunityTypes;
  const missingSalary =
    !types || types.length === 0
      ? true
      : types.some(
          (type) =>
            (type === "JOB" &&
              (profile.expectedSalaryCLT == null ||
                profile.expectedSalaryPJ == null)) ||
            (type === "PROJECT" &&
              (profile.freelanceMinExpectation == null ||
                profile.freelanceMaxExpectation == null))
        );
  return noSkills || noLocation || missingSalary;
}

export default function OpportunitiesPage() {
  const { data: opportunities, isLoading } = useOpportunities();
  const { data: profile } = useProfessionalProfile();
  const { data: skillCatalog } = useSkillCatalog();
  const showInterest = useShowInterest();
  const [search, setSearch] = useState("");
  const [opportunityType, setOpportunityType] = useState<
    "" | "JOB" | "PROJECT"
  >("");
  const [modality, setModality] = useState<string>("");
  const [workType, setWorkType] = useState<string>("");
  const [contractType, setContractType] = useState<string>("");
  const [postedDate, setPostedDate] = useState("");
  const [expLevels, setExpLevels] = useState<string[]>([]);
  const [skillNames, setSkillNames] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [sentIds, setSentIds] = useState<number[]>([]);

  function clearFilters() {
    setSearch("");
    setOpportunityType("");
    setModality("");
    setWorkType("");
    setContractType("");
    setPostedDate("");
    setExpLevels([]);
    setSkillNames([]);
    setMinBudget("");
    setMaxBudget("");
    setMinSalary("");
    setMaxSalary("");
  }

  const filtered = useMemo(() => {
    if (!opportunities) return [];
    const term = search.trim().toLowerCase();
    const min = parseFloat(minBudget) || 0;
    const max = parseFloat(maxBudget) || Infinity;
    const minSal = parseFloat(minSalary) || 0;
    const maxSal = parseFloat(maxSalary) || Infinity;

    return opportunities.filter((match) => {
      const { project } = match;
      const matchesSearch =
        !term ||
        project.title.toLowerCase().includes(term) ||
        project.companyName.toLowerCase().includes(term);
      const matchesType =
        !opportunityType || project.opportunityType === opportunityType;
      const matchesModality = !modality || project.workMode === modality;
      const matchesContractType =
        !contractType || project.contractType === contractType;
      const matchesExpLevel =
        expLevels.length === 0 ||
        (project.experienceLevel != null &&
          expLevels.includes(project.experienceLevel));
      const matchesPostedDate =
        !postedDate ||
        (project.createdAt != null &&
          project.createdAt.slice(0, 10) === postedDate);
      const matchesWorkType = !workType || project.type === workType;
      const matchesSkills = skillNames.every((name) =>
        project.requiredSkills.some(
          (skill) => skill.name.toLowerCase() === name.toLowerCase()
        )
      );

      let matchesBudget = true;
      if (opportunityType === "PROJECT") {
        matchesBudget =
          (project.maximumBudget ?? Infinity) >= min &&
          (project.minimumBudget ?? 0) <= max;
      }

      let matchesSalary = true;
      if (
        opportunityType === "JOB" &&
        (contractType === "CLT" || contractType === "PJ")
      ) {
        matchesSalary =
          (project.monthlySalaryMax ?? Infinity) >= minSal &&
          (project.monthlySalaryMin ?? 0) <= maxSal;
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesModality &&
        matchesContractType &&
        matchesExpLevel &&
        matchesPostedDate &&
        matchesWorkType &&
        matchesSkills &&
        matchesBudget &&
        matchesSalary
      );
    });
  }, [
    opportunities,
    search,
    opportunityType,
    modality,
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

  function handleInterest(projectId: number) {
    showInterest.mutate(projectId, {
      onSuccess: () => {
        setSentIds((ids) => [...ids, projectId]);
        toast.success("Interesse enviado à empresa!");
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível enviar seu interesse."
        );
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Oportunidades para você
        </h1>
        <p className="text-muted-foreground text-sm">
          {opportunities?.length ?? 0} oportunidades compatíveis com seu perfil
        </p>
      </div>

      {profile && profile.available === false && (
        <div className="bg-info/10 flex flex-wrap items-center justify-between gap-2 rounded-md p-3 text-sm">
          <span className="text-foreground">
            Sua conta está marcada como indisponível. Vá para Meu Perfil e
            marque como disponível caso deseje participar do cálculo de
            compatibilidade com as oportunidades.
          </span>
          <Link
            href="/pro/profile"
            className="text-primary shrink-0 font-medium hover:underline"
          >
            Meu Perfil
          </Link>
        </div>
      )}

      {profile && missingScoreRelevantFields(profile) && (
        <div className="bg-info/10 text-foreground rounded-md p-3 text-sm">
          Complete o perfil e adicione Projetos do seu portfólio para aumentar o
          score entre as oportunidades
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border p-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Título ou empresa..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="PROJECT">Projetos</SelectItem>
              <SelectItem value="JOB">Vagas</SelectItem>
            </SelectContent>
          </Select>
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
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <MultiSelectPopover
            label="Skills"
            options={(skillCatalog ?? []).map((s) => ({
              value: s.name,
              label: s.name,
            }))}
            value={skillNames}
            onChange={setSkillNames}
          />
        </div>

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

      <div className="text-muted-foreground text-sm">
        Exibindo{" "}
        <span className="text-foreground font-semibold">{filtered.length}</span>{" "}
        de {opportunities?.length ?? 0} oportunidades
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!isLoading && opportunities?.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Nenhuma oportunidade disponível"
          description="Quando projetos compatíveis com seu perfil surgirem, aparecerão aqui."
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
        {filtered.map((match) => {
          const alreadySent =
            sentIds.includes(match.project.id) ||
            match.professionalStatus === "INTERESTED";
          return (
            <MatchCard
              key={match.id}
              match={match}
              mySkills={profile?.skills}
              actions={
                <>
                  {match.project.companyId != null && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/pro/companies/${match.project.companyId}`}>
                        Ver empresa
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/public/opportunity/${match.project.id}`}>
                      <Eye className="size-4" />
                      Ver detalhes
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    disabled={alreadySent || showInterest.isPending}
                    onClick={() => handleInterest(match.project.id)}
                  >
                    <Handshake className="size-4" />
                    {alreadySent ? "Interesse enviado" : "Demonstrar interesse"}
                  </Button>
                </>
              }
            />
          );
        })}
      </div>
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
