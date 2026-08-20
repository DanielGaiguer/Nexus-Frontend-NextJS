"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table";
import { adminTableFeatures } from "@/components/admin/table-features";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCloseProjectAsAdmin } from "@/hooks/mutations/useAdminProjectActions";
import { useAdminProjects } from "@/hooks/queries/useAdminProjects";
import { ApiError } from "@/lib/api-client";
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

const helper = createColumnHelper<
  typeof adminTableFeatures,
  ProjectResponseDTO
>();

export default function AdminProjectsPage() {
  const { data: projects, isLoading } = useAdminProjects();
  const [status, setStatus] = useState<"all" | "OPEN" | "CLOSED">("all");

  const counts = useMemo(() => {
    const list = projects ?? [];
    return {
      open: list.filter((p) => p.status === "OPEN").length,
      closed: list.filter((p) => p.status === "CLOSED").length,
    };
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (status === "all") return projects;
    if (status === "OPEN") return projects.filter((p) => p.status === "OPEN");
    return projects.filter(
      (p) => p.status === "CLOSED" || p.status === "PAUSED"
    );
  }, [projects, status]);

  const columns = useMemo(
    () => [
      helper.accessor("title", {
        header: "Título",
        cell: (info) => {
          const project = info.row.original;
          return (
            <div>
              <Link
                href={`/public/opportunity/${project.id}`}
                className="font-medium hover:underline"
              >
                {project.title}
              </Link>
              <div className="mt-0.5">
                <Badge
                  variant={
                    project.opportunityType === "JOB" ? "default" : "secondary"
                  }
                  className="text-[10px]"
                >
                  {project.opportunityType === "JOB" ? "Vaga" : "Projeto"}
                </Badge>
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
          Encerrar
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
