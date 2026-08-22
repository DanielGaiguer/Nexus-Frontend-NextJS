"use client";

import { PlayCircle, StopCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCloseProject,
  useResumeProject,
} from "@/hooks/mutations/useProjectMutations";
import { ApiError } from "@/lib/api-client";
import type { ProjectResponseDTO } from "@/types/project";

/**
 * Espelha company-projects.html :: #pausedModal (nexus-frontend antigo) — ao
 * entrar em "Meus Projetos" com algum projeto pausado por ter atingido o
 * limite de vagas, abre automaticamente essa janela de decisão (reabrir com
 * mais vagas, encerrar, ou responder depois) para o primeiro projeto pausado
 * encontrado. Só dispara uma vez por carregamento da lista — não reabre a
 * cada refetch (ex.: depois de outra mutation qualquer invalidar a query).
 */
export function PausedProjectDialog({
  projects,
}: {
  projects: ProjectResponseDTO[] | undefined;
}) {
  // Checa a lista assim que ela chega e nunca mais depois disso — não usa
  // useEffect porque o alvo é "só uma vez, quando os dados chegarem", não
  // "toda vez que `projects` mudar de referência" (o que aconteceria a
  // cada refetch em segundo plano e reabriria o modal repetidamente).
  // Setar estado direto no corpo do render, condicionado a `checked` ainda
  // ser false, é o padrão recomendado pelo React pra esse tipo de ajuste
  // (evita o efeito e o flash de um render extra).
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState<ProjectResponseDTO | null>(null);
  const [additional, setAdditional] = useState("1");
  const resumeProject = useResumeProject();
  const closeProject = useCloseProject();

  if (!checked && projects) {
    setChecked(true);
    const firstPaused = projects.find((p) => p.status === "PAUSED");
    if (firstPaused) {
      setProject(firstPaused);
      setOpen(true);
    }
  }

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Limite de vagas atingido</DialogTitle>
          <DialogDescription>
            O projeto{" "}
            <strong className="text-foreground">{project.title}</strong>{" "}
            preencheu todas as vagas disponíveis e foi pausado automaticamente.
            Ele não aparece mais para novos profissionais. O que você deseja
            fazer?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="pausedAdditionalPositions">
            Reabrir com mais vagas
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="pausedAdditionalPositions"
              type="number"
              min={1}
              value={additional}
              onChange={(e) => setAdditional(e.target.value)}
              className="max-w-24"
            />
            <Button
              disabled={resumeProject.isPending || Number(additional) < 1}
              onClick={() =>
                resumeProject.mutate(
                  {
                    id: project.id,
                    additionalPositions: Number(additional),
                  },
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
              <PlayCircle className="size-3.5" />
              {resumeProject.isPending ? "Reabrindo…" : "Reabrir"}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Limite atual: {project.maxPositions ?? "—"} vaga(s) — informe
            quantas vagas extras deseja adicionar
          </p>
        </div>

        <Button
          variant="outline"
          className="text-destructive w-full"
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
          <StopCircle className="size-3.5" />
          {closeProject.isPending ? "Encerrando…" : "Encerrar projeto"}
        </Button>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Responder depois
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
