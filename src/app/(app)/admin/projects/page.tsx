"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Lock, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCloseProjectAsAdmin } from "@/hooks/mutations/useAdminProjectActions";
import { useAdminProjects } from "@/hooks/queries/useAdminProjects";
import { useProjectSkillCatalog } from "@/hooks/queries/useProjectSkillCatalog";
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
  const { data: skillCatalog } = useProjectSkillCatalog();
  const [status, setStatus] = useState<"all" | "OPEN" | "CLOSED">("all");
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
        (!oppType || p.opportunityType === oppType) &&
        matchesOpportunityFilters(p, oppFilters)
    );
  }, [projects, status, oppType, oppFilters]);

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

      <div className="flex flex-col gap-3 rounded-lg border p-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            value={oppFilters.modality || "ALL"}
            onValueChange={(v) =>
              setOppFilters((f) => ({
                ...f,
                modality: v === "ALL" ? "" : v,
              }))
            }
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
          <MultiSelectPopover
            label="Experiência"
            options={experienceLevelOptions}
            value={oppFilters.expLevels}
            onChange={(v) => setOppFilters((f) => ({ ...f, expLevels: v }))}
          />
          <Input
            type="date"
            value={oppFilters.postedDate}
            onChange={(e) =>
              setOppFilters((f) => ({ ...f, postedDate: e.target.value }))
            }
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            value={oppFilters.projectType || "ALL"}
            onValueChange={(v) =>
              setOppFilters((f) => ({
                ...f,
                projectType: v === "ALL" ? "" : v,
              }))
            }
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
            options={skillOptions}
            value={oppFilters.skills}
            onChange={(v) => setOppFilters((f) => ({ ...f, skills: v }))}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-self-start"
            onClick={() => {
              setOppType("");
              setOppFilters(emptyOpportunityFilters);
            }}
          >
            <X className="size-4" />
            Limpar
          </Button>
        </div>

        {oppType === "JOB" && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              value={oppFilters.contractType || "ALL"}
              onValueChange={(v) =>
                setOppFilters((f) => ({
                  ...f,
                  contractType: v === "ALL" ? "" : v,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de contrato" />
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
            {(oppFilters.contractType === "CLT" ||
              oppFilters.contractType === "PJ") && (
              <>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  placeholder="Salário mín. (R$/mês)"
                  value={oppFilters.minSalary}
                  onChange={(e) =>
                    setOppFilters((f) => ({
                      ...f,
                      minSalary: e.target.value,
                    }))
                  }
                />
                <Input
                  type="number"
                  min={0}
                  step={100}
                  placeholder="Salário máx. (R$/mês)"
                  value={oppFilters.maxSalary}
                  onChange={(e) =>
                    setOppFilters((f) => ({
                      ...f,
                      maxSalary: e.target.value,
                    }))
                  }
                />
              </>
            )}
          </div>
        )}

        {oppType === "PROJECT" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="number"
              min={0}
              step={100}
              placeholder="Orçamento mín. (R$)"
              value={oppFilters.minBudget}
              onChange={(e) =>
                setOppFilters((f) => ({ ...f, minBudget: e.target.value }))
              }
            />
            <Input
              type="number"
              min={0}
              step={100}
              placeholder="Orçamento máx. (R$)"
              value={oppFilters.maxBudget}
              onChange={(e) =>
                setOppFilters((f) => ({ ...f, maxBudget: e.target.value }))
              }
            />
          </div>
        )}
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="OPEN">Abertos</TabsTrigger>
          <TabsTrigger value="CLOSED">Encerrados</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchPlaceholder="Título ou empresa..."
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
