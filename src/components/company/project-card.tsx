"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Eye,
  Pencil,
  PlayCircle,
  RotateCcw,
  StopCircle,
  Trash2,
  Users,
} from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCloseProject,
  useDeleteProject,
  useReopenProject,
  useResumeProject,
} from "@/hooks/mutations/useProjectMutations";
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

export function ProjectCard({ project }: { project: ProjectResponseDTO }) {
  const closeProject = useCloseProject();
  const deleteProject = useDeleteProject();
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  project.opportunityType === "JOB" ? "default" : "secondary"
                }
              >
                {project.opportunityType === "JOB" ? (
                  <Building2 className="size-3" />
                ) : (
                  <Briefcase className="size-3" />
                )}
                {project.opportunityType === "JOB" ? "Vaga" : "Projeto"}
              </Badge>
              <Badge variant={statusVariant[project.status]}>
                {statusLabels[project.status]}
              </Badge>
            </div>
            <Link
              href={`/company/projects/${project.id}/ranking`}
              className="mt-1 block font-semibold hover:underline"
            >
              {project.title}
            </Link>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Users className="size-3" />
              {project.filledPositions ?? 0}/{project.maxPositions ?? "—"}{" "}
              posições preenchidas
            </div>
          </div>
        </div>

        {project.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.requiredSkills.map((skill) => (
              <Badge key={skill.id} variant="outline" className="text-[11px]">
                {skill.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/public/opportunity/${project.id}`}>
              <Eye className="size-3.5" />
              Ver oportunidade
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/company/projects/${project.id}/ranking`}>
              <Users className="size-3.5" />
              Ranking
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/company/projects/${project.id}/edit`}>
              <Pencil className="size-3.5" />
              Editar
            </Link>
          </Button>

          {project.status === "OPEN" && (
            <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <StopCircle className="size-3.5" />
                  Encerrar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Encerrar oportunidade</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso encerra <strong>{project.title}</strong> e cancela os
                    matches pendentes (nunca confirmados). Matches já
                    confirmados não são afetados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={closeProject.isPending}
                    onClick={() =>
                      closeProject.mutate(project.id, {
                        onSuccess: () => {
                          toast.success("Oportunidade encerrada.");
                          setConfirmClose(false);
                        },
                        onError: (error) =>
                          toast.error(
                            error instanceof ApiError
                              ? error.message
                              : "Não foi possível encerrar."
                          ),
                      })
                    }
                  >
                    {closeProject.isPending ? "Encerrando…" : "Encerrar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {project.status === "PAUSED" && (
            <ResumeProjectDialog project={project} />
          )}
          {project.status === "CLOSED" && (
            <ReopenProjectDialog project={project} />
          )}

          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive">
                <Trash2 className="size-3.5" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir oportunidade</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir{" "}
                  <strong>{project.title}</strong>? Esta ação não pode ser
                  desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteProject.isPending}
                  onClick={() =>
                    deleteProject.mutate(project.id, {
                      onSuccess: () => toast.success("Oportunidade excluída."),
                      onError: (error) =>
                        toast.error(
                          error instanceof ApiError
                            ? error.message
                            : "Não foi possível excluir."
                        ),
                    })
                  }
                >
                  {deleteProject.isPending ? "Excluindo…" : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function ResumeProjectDialog({ project }: { project: ProjectResponseDTO }) {
  const [open, setOpen] = useState(false);
  const [additional, setAdditional] = useState("1");
  const resumeProject = useResumeProject();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <PlayCircle className="size-3.5" />
          Retomar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Retomar oportunidade</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Esta vaga foi pausada automaticamente por atingir o limite de
          posições. Some quantas vagas extras quer abrir para voltar a receber
          matches.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="additionalPositions">Vagas adicionais</Label>
          <Input
            id="additionalPositions"
            type="number"
            min={1}
            value={additional}
            onChange={(e) => setAdditional(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={resumeProject.isPending || Number(additional) < 1}
            onClick={() =>
              resumeProject.mutate(
                { id: project.id, additionalPositions: Number(additional) },
                {
                  onSuccess: () => {
                    toast.success("Oportunidade retomada.");
                    setOpen(false);
                  },
                  onError: (error) =>
                    toast.error(
                      error instanceof ApiError
                        ? error.message
                        : "Não foi possível retomar."
                    ),
                }
              )
            }
          >
            {resumeProject.isPending ? "Retomando…" : "Retomar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReopenProjectDialog({ project }: { project: ProjectResponseDTO }) {
  const [open, setOpen] = useState(false);
  const [maxPositions, setMaxPositions] = useState(
    String(project.maxPositions ?? 1)
  );
  const reopenProject = useReopenProject();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <RotateCcw className="size-3.5" />
          Reabrir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reabrir oportunidade</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="maxPositions">Vagas disponíveis</Label>
          <Input
            id="maxPositions"
            type="number"
            min={project.filledPositions ?? 0}
            value={maxPositions}
            onChange={(e) => setMaxPositions(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={reopenProject.isPending}
            onClick={() =>
              reopenProject.mutate(
                { id: project.id, maxPositions: Number(maxPositions) },
                {
                  onSuccess: () => {
                    toast.success("Oportunidade reaberta.");
                    setOpen(false);
                  },
                  onError: (error) =>
                    toast.error(
                      error instanceof ApiError
                        ? error.message
                        : "Não foi possível reabrir."
                    ),
                }
              )
            }
          >
            {reopenProject.isPending ? "Reabrindo…" : "Reabrir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
