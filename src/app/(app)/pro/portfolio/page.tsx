"use client";

import { Briefcase, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PreviousProjectFormDialog } from "@/components/professional/previous-project-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeletePreviousProject } from "@/hooks/mutations/usePreviousProjectMutations";
import { usePreviousProjects } from "@/hooks/queries/usePreviousProjects";
import { ApiError } from "@/lib/api-client";
import type { PreviousProjectDTO } from "@/types/previous-project";

export default function PortfolioPage() {
  const { data: projects, isLoading } = usePreviousProjects();
  const [deleting, setDeleting] = useState<PreviousProjectDTO | null>(null);
  const deleteProject = useDeletePreviousProject();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfólio</h1>
          <p className="text-muted-foreground text-sm">
            Projetos anteriores — impactam o componente de histórico do seu
            score.
          </p>
        </div>
        <PreviousProjectFormDialog />
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!isLoading && (!projects || projects.length === 0) && (
        <EmptyState
          icon={Briefcase}
          title="Nenhum projeto no portfólio ainda"
          description="Adicione projetos que você já entregou pra fortalecer seu perfil."
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {projects?.map((project) => (
          <Card key={project.id}>
            <CardHeader className="flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{project.title}</CardTitle>
                {project.yearOfCompletion && (
                  <p className="text-muted-foreground text-xs">
                    {project.yearOfCompletion}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <PreviousProjectFormDialog editing={project} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  aria-label="Remover projeto"
                  onClick={() => setDeleting(project)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.description && (
                <p className="text-muted-foreground text-sm">
                  {project.description}
                </p>
              )}
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={deleting != null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deleting?.title}</strong>{" "}
              do seu portfólio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteProject.isPending}
              onClick={() => {
                if (!deleting) return;
                deleteProject.mutate(deleting.id, {
                  onSuccess: () => {
                    toast.success("Projeto removido.");
                    setDeleting(null);
                  },
                  onError: (error) => {
                    toast.error(
                      error instanceof ApiError
                        ? error.message
                        : "Não foi possível remover."
                    );
                  },
                });
              }}
            >
              {deleteProject.isPending ? "Removendo…" : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
