"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  MapPin,
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
  PAUSED: "Pausado — limite de vagas atingido",
  CLOSED: "Encerrado",
};

const modalityLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

const contractTypeLabels: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  INTERNSHIP: "Estágio",
  TEMPORARY: "Temporário",
  FREELANCER: "Freelancer",
};

function money(value: number) {
  // Espelha #numbers.formatDecimal(x,1,'COMMA',0,'POINT') do template original.
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ProjectCard({ project }: { project: ProjectResponseDTO }) {
  const deleteProject = useDeleteProject();
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
              {project.visibleToCompanies === false && (
                <Badge
                  variant="outline"
                  className="text-muted-foreground"
                  title="Não aparece para outras empresas no mapa nem na aba Oportunidades"
                >
                  <EyeOff className="size-3" />
                  Oculto p/ empresas
                </Badge>
              )}
            </div>
            <Link
              href={`/company/projects/${project.id}/ranking`}
              className="mt-1 block font-semibold hover:underline"
            >
              {project.title}
            </Link>
            <div className="text-muted-foreground text-xs">
              Criado em {formatDate(project.createdAt)}
            </div>
          </div>
          <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
            <Users className="size-3" />
            {project.filledPositions ?? 0}/{project.maxPositions ?? "—"}{" "}
            posições preenchidas
          </div>
        </div>

        {project.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {project.description}
          </p>
        )}

        <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
          {project.opportunityType !== "JOB" &&
            project.minimumBudget != null &&
            project.maximumBudget != null && (
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5" />
                R${money(project.minimumBudget)}–R$
                {money(project.maximumBudget)}
              </span>
            )}
          {project.opportunityType === "JOB" &&
            project.monthlySalaryMin != null && (
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5" />
                R${money(project.monthlySalaryMin)}/mês
                {project.monthlySalaryMax != null &&
                  `–R$${money(project.monthlySalaryMax)}`}
              </span>
            )}
          {project.workMode && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {modalityLabels[project.workMode] ?? project.workMode}
            </span>
          )}
          {project.opportunityType !== "JOB" && project.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Prazo: {formatDate(project.deadline)}
            </span>
          )}
          {project.opportunityType === "JOB" && project.startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Início: {formatDate(project.startDate)}
            </span>
          )}
          {project.opportunityType === "JOB" && project.contractType && (
            <span className="flex items-center gap-1">
              <FileText className="size-3.5" />
              {contractTypeLabels[project.contractType] ?? project.contractType}
            </span>
          )}
          {project.opportunityType === "JOB" &&
            project.workloadHoursPerWeek != null && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {project.workloadHoursPerWeek}h/sem
              </span>
            )}
        </div>

        {project.opportunityType === "JOB" && project.benefits && (
          <div className="flex flex-wrap gap-1">
            {project.benefits.split(",").map((benefit) => (
              <Badge key={benefit} variant="outline" className="text-[11px]">
                {benefit.trim()}
              </Badge>
            ))}
          </div>
        )}

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
            <CloseProjectDialog project={project} />
          )}

          {project.status === "PAUSED" && (
            <>
              <ResumeProjectDialog project={project} />
              {/* Vagas preenchidas e a empresa não quer abrir mais posições
                  — precisa poder encerrar direto daqui, sem passar pelo
                  modal automático (que só aparece uma vez, pro primeiro
                  projeto pausado). */}
              <CloseProjectDialog project={project} />
            </>
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

function CloseProjectDialog({ project }: { project: ProjectResponseDTO }) {
  const closeProject = useCloseProject();
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
            Isso encerra <strong>{project.title}</strong> e cancela os matches
            pendentes (nunca confirmados). Matches já confirmados não são
            afetados.
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
                  setOpen(false);
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
