"use client";

import {
  Award,
  Briefcase,
  Building2,
  Check,
  DollarSign,
  GitCompare,
  Handshake,
  MapPin,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyShowInterestByProject } from "@/hooks/mutations/useCompanyMatchActions";
import { useMatchStatusByPair } from "@/hooks/queries/useMatchStatusByPair";
import { useMyProjects } from "@/hooks/queries/useMyProjects";
import { usePublicProfessional } from "@/hooks/queries/usePublicProfessional";
import { ApiError } from "@/lib/api-client";

const experienceLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

const workModeLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

function money(value: number | null | undefined) {
  return value != null
    ? value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      })
    : "—";
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
      {children}
    </p>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="text-primary mt-0.5 size-4 shrink-0" />
      <div>
        <div className="text-muted-foreground text-xs">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

/**
 * Comparação de um profissional do diretório geral (/company/professionals)
 * com uma vaga — diferente de MatchCompareDialog: aqui não existe match
 * nenhum ainda (o profissional pode nunca ter sido comparado com essa
 * empresa), então não tem score do backend pra reaproveitar. A empresa
 * escolhe qual dos próprios projetos comparar, e o cruzamento de skills é
 * calculado aqui mesmo, no client.
 */
export function ProfessionalCompareDialog({
  professionalId,
}: {
  professionalId: number;
}) {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const myProjects = useMyProjects();
  const detail = usePublicProfessional(open ? professionalId : undefined);
  const showInterest = useCompanyShowInterestByProject();

  const openProjects = (myProjects.data ?? []).filter(
    (p) => p.status === "OPEN" || p.status === "PAUSED"
  );
  const project = openProjects.find((p) => p.id === Number(projectId));
  const isJob = project?.opportunityType === "JOB";

  // "Demonstrar interesse" só aparece quando os dois ainda não têm nenhum
  // envolvimento nesse projeto -- sem match ainda, ou só o WAITING gerado
  // automaticamente pelo ranking. Já em andamento (*_INTERESTED/MATCHED) ou
  // recusado (REJECTED), o botão some.
  const matchStatus = useMatchStatusByPair(professionalId, project?.id);
  const showInterestButton =
    !!project &&
    (matchStatus.data?.status == null || matchStatus.data.status === "WAITING");

  const professionalSkillsLower = new Set(
    (detail.data?.skills ?? []).map((s) => s.toLowerCase())
  );
  const matchingSkills =
    project?.requiredSkills.filter((s) =>
      professionalSkillsLower.has(s.name.toLowerCase())
    ) ?? [];
  const missingSkills =
    project?.requiredSkills.filter(
      (s) => !professionalSkillsLower.has(s.name.toLowerCase())
    ) ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setProjectId("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <GitCompare className="size-3.5" />
          Comparar
        </Button>
      </DialogTrigger>
      <DialogContent className="scrollbar-hide max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Profissional × Vaga</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <label className="text-muted-foreground text-xs font-medium">
            Comparar com qual dos seus projetos?
          </label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um projeto ou vaga" />
            </SelectTrigger>
            <SelectContent>
              {openProjects.length === 0 ? (
                <div className="text-muted-foreground px-2 py-1.5 text-sm">
                  Nenhum projeto aberto no momento.
                </div>
              ) : (
                openProjects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {project && detail.isPending && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-32" />
          </div>
        )}

        {project && detail.data && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-1 text-center">
                <Avatar className="size-14">
                  <AvatarImage
                    src={detail.data.profilePhotoUrl ?? undefined}
                    alt=""
                  />
                  <AvatarFallback>
                    {detail.data.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{detail.data.name}</span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <MapPin className="size-3" />
                  {[detail.data.city, detail.data.uf]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="bg-muted flex size-14 items-center justify-center rounded-xl">
                  {isJob ? (
                    <Building2 className="text-primary size-6" />
                  ) : (
                    <Briefcase className="text-primary size-6" />
                  )}
                </div>
                <span className="font-semibold">{project.title}</span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <MapPin className="size-3" />
                  {[project.city, project.uf].filter(Boolean).join(", ") || "—"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant={isJob ? "default" : "secondary"}>
                {isJob ? "Vaga" : "Projeto"}
              </Badge>
              {project.workMode && (
                <Badge variant="outline">
                  <MapPin className="size-3" />
                  {workModeLabels[project.workMode] ?? project.workMode}
                </Badge>
              )}
            </div>

            <div>
              <SectionLabel>Skills exigidas pelo projeto</SectionLabel>
              <div className="mt-2 flex flex-wrap gap-1">
                {project.requiredSkills.length > 0 ? (
                  project.requiredSkills.map((s) => (
                    <Badge key={s.id} variant="outline">
                      {s.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Nenhuma skill exigida.
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <SectionLabel>Compatíveis</SectionLabel>
                <div className="mt-2 flex flex-col gap-1">
                  {matchingSkills.length > 0 ? (
                    matchingSkills.map((s) => (
                      <Badge
                        key={s.id}
                        className="bg-success/15 text-success w-fit"
                      >
                        <Check className="size-3" />
                        {s.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </div>
              <div>
                <SectionLabel>Faltantes</SectionLabel>
                <div className="mt-2 flex flex-col gap-1">
                  {missingSkills.length > 0 ? (
                    missingSkills.map((s) => (
                      <Badge key={s.id} variant="destructive" className="w-fit">
                        <X className="size-3" />
                        {s.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <InfoRow
                icon={Star}
                label="Avaliação do profissional"
                value={
                  detail.data.reputation != null ? (
                    <span className="flex items-center gap-1">
                      {detail.data.reputation.toFixed(1)}
                      <Star className="fill-warning text-warning size-3.5" />
                    </span>
                  ) : (
                    "Sem avaliações"
                  )
                }
              />
              <InfoRow
                icon={Award}
                label="Experiência"
                value={
                  <span className="flex items-center gap-1.5">
                    {detail.data.experienceLevel
                      ? (experienceLabels[detail.data.experienceLevel] ??
                        detail.data.experienceLevel)
                      : "—"}
                    {project.experienceLevel != null &&
                      detail.data.experienceLevel != null &&
                      (detail.data.experienceLevel ===
                      project.experienceLevel ? (
                        <Check className="text-success size-3.5" />
                      ) : (
                        <X className="text-warning size-3.5" />
                      ))}
                  </span>
                }
              />
              <InfoRow
                icon={Check}
                label="Disponível agora"
                value={detail.data.available ? "Sim" : "Não"}
              />
              <InfoRow
                icon={Briefcase}
                label="Projetos anteriores"
                value={detail.data.previousProjects.length}
              />
              <InfoRow
                icon={DollarSign}
                label="Pretensão do profissional"
                value={`${money(detail.data.minimumSalary)} – ${money(detail.data.maximumSalary)}`}
              />
              <InfoRow
                icon={DollarSign}
                label={isJob ? "Salário da vaga" : "Orçamento do projeto"}
                value={
                  isJob
                    ? `${money(project.monthlySalaryMin)} – ${money(project.monthlySalaryMax)}`
                    : `${money(project.minimumBudget)} – ${money(project.maximumBudget)}`
                }
              />
            </div>

            {showInterestButton && (
              <div className="flex justify-end border-t pt-3">
                <Button
                  size="sm"
                  disabled={showInterest.isPending}
                  onClick={() =>
                    showInterest.mutate(
                      { professionalId, projectId: project.id },
                      {
                        onSuccess: () => {
                          toast.success("Convite enviado ao profissional!");
                          setOpen(false);
                        },
                        onError: (error) =>
                          toast.error(
                            error instanceof ApiError
                              ? error.message
                              : "Não foi possível enviar o convite."
                          ),
                      }
                    )
                  }
                >
                  <Handshake className="size-4" />
                  {showInterest.isPending
                    ? "Enviando…"
                    : "Demonstrar interesse"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
