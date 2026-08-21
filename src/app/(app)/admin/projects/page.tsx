"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Lock, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table";
import { adminTableFeatures } from "@/components/admin/table-features";
import { MultiSelectPopover } from "@/components/shared/multi-select-popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { useCloseProjectAsAdmin } from "@/hooks/mutations/useAdminProjectActions";
import { useAdminProjects } from "@/hooks/queries/useAdminProjects";
import { useSkillCatalog } from "@/hooks/queries/useSkillCatalog";
import { ApiError } from "@/lib/api-client";
import {
  contractTypeOptions,
  emptyOpportunityFilters,
  experienceLevelOptions,
  matchesOpportunityFilters,
} from "@/lib/opportunity-filters";
import type { ProjectResponseDTO } from "@/types/project";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  OPEN: "default",
  PAUSED: "secondary",
  CLOSED: "outline",
};

const statusLabels: Record<string, string> = {
  OPEN: "Aberto",
  PAUSED: "Pausado",
  CLOSED: "Encerrado",
};

const modalityLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

function formatMoney(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const helper = createColumnHelper<
  typeof adminTableFeatures,
  ProjectResponseDTO
>();

export default function AdminProjectsPage() {
  const { data: projects, isLoading } = useAdminProjects();
  const { data: skillCatalog } = useSkillCatalog();
  const [status, setStatus] = useState<"all" | "OPEN" | "CLOSED">("all");
  const [search, setSearch] = useState("");
  const [oppType, setOppType] = useState<"" | "PROJECT" | "JOB">("");
  const [oppFilters, setOppFilters] = useState(emptyOpportunityFilters);

  const counts = useMemo(() => {
    const list = projects ?? [];
    return {
      open: list.filter((p) => p.status === "OPEN").length,
      closed: list.filter((p) => p.status === "CLOSED").length,
    };
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    const term = search.trim().toLowerCase();
    const byStatus =
      status === "all"
        ? projects
        : status === "OPEN"
          ? projects.filter((p) => p.status === "OPEN")
          : projects.filter(
              (p) => p.status === "CLOSED" || p.status === "PAUSED"
            );
    return byStatus.filter(
      (p) =>
        (!term ||
          p.title.toLowerCase().includes(term) ||
          p.companyName.toLowerCase().includes(term)) &&
        (!oppType || p.opportunityType === oppType) &&
        matchesOpportunityFilters(p, oppFilters)
    );
  }, [projects, status, search, oppType, oppFilters]);

  const skillOptions = (skillCatalog ?? []).map((s) => ({
    value: s.name,
    label: s.name,
  }));

  const columns = useMemo(
    () => [
      helper.accessor("title", {
        header: "Título",
        cell: (info) => {
          const project = info.row.original;
          const isJob = project.opportunityType === "JOB";
          const money = isJob
            ? project.monthlySalaryMin != null
              ? `R$${formatMoney(project.monthlySalaryMin)}/mês`
              : null
            : project.minimumBudget != null && project.maximumBudget != null
              ? `R$${formatMoney(project.minimumBudget)}–R$${formatMoney(project.maximumBudget)}`
              : null;
          return (
            <div>
              <Link
                href={`/public/opportunity/${project.id}`}
                className="font-medium hover:underline"
              >
                {project.title}
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant={isJob ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {isJob ? "Vaga" : "Projeto"}
                </Badge>
                {money && (
                  <span className="text-muted-foreground text-xs">{money}</span>
                )}
                {project.workMode && (
                  <span className="text-muted-foreground text-xs">
                    · {modalityLabels[project.workMode] ?? project.workMode}
                  </span>
                )}
              </div>
            </div>
          );
        },
      }),
      helper.accessor("companyName", {
        header: "Empresa",
        cell: (info) => (
          <Link
            href={`/admin/company/${info.row.original.companyId}`}
            className="hover:underline"
          >
            {info.getValue()}
          </Link>
        ),
      }),
      helper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge variant={statusVariant[info.getValue()]}>
            {statusLabels[info.getValue()]}
          </Badge>
        ),
      }),
      helper.display({
        id: "positions",
        header: "Posições",
        cell: (info) => {
          const p = info.row.original;
          return (
            <span className="tabular-nums">
              {p.filledPositions ?? 0}/{p.maxPositions ?? "—"}
            </span>
          );
        },
      }),
      helper.accessor("createdAt", {
        header: "Criado em",
        cell: (info) => (
          <span className="text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString("pt-BR")}
          </span>
        ),
        sortFn: "basic",
      }),
      helper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const project = info.row.original;
          if (project.status !== "OPEN") return null;
          return <CloseProjectAction project={project} />;
        },
      }),
    ],
    []
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Todas as Oportunidades
          </h1>
          <p className="text-muted-foreground text-sm">
            {projects?.length ?? 0} projetos publicados na plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default">{counts.open} abertos</Badge>
          <Badge variant="outline">{counts.closed} encerrados</Badge>
        </div>
      </div>

      {/* Espelha o painel único de filtros do admin-projects.html original
          (label uppercase acima de cada campo, busca integrada no mesmo
          painel — não uma caixa de busca solta embaixo de tabs). */}
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
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as typeof status)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="OPEN">Aberto</SelectItem>
                <SelectItem value="CLOSED">Encerrado</SelectItem>
              </SelectContent>
            </Select>
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
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Modalidade
            </Label>
            <Select
              value={oppFilters.modality || "ALL"}
              onValueChange={(v) =>
                setOppFilters((f) => ({
                  ...f,
                  modality: v === "ALL" ? "" : v,
                }))
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
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
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
            onClick={() => {
              setStatus("all");
              setSearch("");
              setOppType("");
              setOppFilters(emptyOpportunityFilters);
            }}
          >
            <X className="size-4" />
            Limpar
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        Exibindo{" "}
        <span className="text-foreground font-semibold">{filtered.length}</span>{" "}
        de {projects?.length ?? 0} projetos
      </p>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          hideSearch
          emptyMessage="Nenhum projeto na plataforma."
        />
      )}
    </div>
  );
}

function CloseProjectAction({ project }: { project: ProjectResponseDTO }) {
  const closeProject = useCloseProjectAsAdmin();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <Lock className="size-3.5" />
          Encerrar oportunidade
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Encerrar oportunidade</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja encerrar <strong>{project.title}</strong>? Ela deixará de
            aceitar novos interesses. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={closeProject.isPending}
            className="bg-destructive hover:bg-destructive/90"
            onClick={() =>
              closeProject.mutate(project.id, {
                onSuccess: () =>
                  toast.success("Oportunidade encerrada com sucesso!"),
                onError: (error) =>
                  toast.error(
                    error instanceof ApiError
                      ? error.message
                      : "Não foi possível encerrar."
                  ),
              })
            }
          >
            {closeProject.isPending ? "Encerrando…" : "Confirmar encerramento"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
