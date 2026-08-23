"use client";

import {
  AlertTriangle,
  Award,
  Briefcase,
  Building2,
  Calendar,
  Check,
  Clock,
  DollarSign,
  FileText,
  GitCompare,
  Handshake,
  MapPin,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ScoreRing } from "@/components/professional/score-ring";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyShowInterest } from "@/hooks/mutations/useCompanyMatchActions";
import { useShowInterest } from "@/hooks/mutations/useShowInterest";
import {
  useCandidateComparison,
  useMyMatchComparison,
} from "@/hooks/queries/useCandidateComparison";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { MatchResponseDTO } from "@/types/match";
import type { ScoreBreakdownDTO } from "@/types/match";

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

const contractTypeLabels: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  INTERNSHIP: "Estágio",
  TEMPORARY: "Temporário",
  FREELANCER: "Freelancer",
};

const matchStatusLabels: Record<string, string> = {
  WAITING: "Aguardando",
  COMPANY_INTERESTED: "Empresa interessada",
  PROFESSIONAL_INTERESTED: "Profissional interessado",
  MATCHED: "Match confirmado",
  REJECTED: "Recusado",
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

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";
}

const breakdownRows: { key: keyof ScoreBreakdownDTO; label: string }[] = [
  { key: "skills", label: "Skills" },
  { key: "budget", label: "Orçamento" },
  { key: "history", label: "Histórico" },
  { key: "reputation", label: "Reputação" },
  { key: "availability", label: "Disponibilidade" },
  { key: "distance", label: "Distância" },
  { key: "experience", label: "Experiência" },
  { key: "reputationAdjustment", label: "Ajuste Reputação" },
];

const tierClasses = {
  success: { text: "text-success", bar: "bg-success" },
  primary: { text: "text-primary", bar: "bg-primary" },
  warning: { text: "text-warning", bar: "bg-warning" },
  destructive: { text: "text-destructive", bar: "bg-destructive" },
} as const;

/** Mesmos limiares de company/projects/[projectId]/compare — ver comentário lá. */
function breakdownTier(
  key: keyof ScoreBreakdownDTO,
  value: number
): keyof typeof tierClasses {
  if (key === "reputationAdjustment")
    return value >= 0 ? "success" : "destructive";
  if (key === "experience") {
    if (value >= 90) return "success";
    if (value >= 70) return "warning";
    return "destructive";
  }
  if (key === "distance") {
    if (value >= 70) return "success";
    if (value >= 50) return "warning";
    return "destructive";
  }
  if (value >= 80) return "success";
  if (value >= 60) return "primary";
  if (value >= 40) return "warning";
  return "destructive";
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
 * Comparação direta de UM profissional com a vaga/projeto de UM match
 * específico — reaproveita o mesmo endpoint de comparação de
 * company/projects/[projectId]/compare (matchIds=[match.id]), que já
 * devolve matchingSkills/missingSkills e o scoreBreakdown calculados pelo
 * backend; os demais dados da vaga (orçamento, modalidade, benefícios,
 * cidade etc.) vêm direto de match.project, sem precisar de outra chamada.
 *
 * `viewer="professional"` (usado em pro/opportunities e pro/matches) troca
 * pra `/api/comparison/candidates/mine` — mesmo formato de resposta, mas o
 * profissional compara consigo mesmo, num match que já é dele, sem
 * depender de ser dono do projeto (que é exclusivo de empresa).
 */
export function MatchCompareDialog({
  match,
  viewer = "company",
}: {
  match: MatchResponseDTO;
  viewer?: "company" | "professional";
}) {
  const [open, setOpen] = useState(false);
  const companyComparison = useCandidateComparison(
    open && viewer === "company"
      ? { projectId: match.project.id, matchIds: [match.id] }
      : undefined
  );
  const professionalComparison = useMyMatchComparison(
    open && viewer === "professional" ? match.id : undefined
  );
  const comparison =
    viewer === "company" ? companyComparison : professionalComparison;
  const data = comparison.data;
  const candidate = data?.candidates[0];

  // "Demonstrar interesse" só faz sentido quando ainda não há nenhum
  // envolvimento entre os dois -- WAITING é só o match gerado
  // automaticamente pelo ranking, sem ação de nenhum lado ainda. Já em
  // andamento (COMPANY_INTERESTED/PROFESSIONAL_INTERESTED/MATCHED) ou
  // recusado (REJECTED), o botão some.
  const canShowInterest = match.status === "WAITING";
  const companyShowInterest = useCompanyShowInterest();
  const professionalShowInterest = useShowInterest();
  const showInterestPending =
    viewer === "company"
      ? companyShowInterest.isPending
      : professionalShowInterest.isPending;

  function handleShowInterest() {
    const onError = (error: unknown) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível enviar o interesse."
      );
    if (viewer === "company") {
      companyShowInterest.mutate(match.id, {
        onSuccess: () => {
          toast.success("Convite enviado ao profissional!");
          setOpen(false);
        },
        onError,
      });
    } else {
      professionalShowInterest.mutate(match.project.id, {
        onSuccess: () => {
          toast.success("Interesse enviado à empresa!");
          setOpen(false);
        },
        onError,
      });
    }
  }
  const project = match.project;
  const isJob = project.opportunityType === "JOB";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        {comparison.isPending && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-40" />
            <Skeleton className="h-32" />
          </div>
        )}

        {comparison.isError && (
          <p className="text-muted-foreground text-sm">
            Não foi possível carregar a comparação.
          </p>
        )}

        {candidate && data && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-1 text-center">
                <Avatar className="size-14">
                  <AvatarImage
                    src={candidate.profilePhotoUrl ?? undefined}
                    alt=""
                  />
                  <AvatarFallback>
                    {candidate.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{candidate.name}</span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <MapPin className="size-3" />
                  {[candidate.city, candidate.state]
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
              <Badge variant="secondary">
                {matchStatusLabels[match.status] ?? match.status}
              </Badge>
            </div>

            <div className="flex flex-col items-center gap-1 border-y py-3">
              <SectionLabel>Score final</SectionLabel>
              <ScoreRing
                score={Math.round(candidate.scoreBreakdown?.finalScore ?? 0)}
                size={90}
              />
            </div>

            {candidate.scoreBreakdown && (
              <div>
                <SectionLabel>Detalhamento do score</SectionLabel>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                  {breakdownRows
                    .filter(
                      (row) => candidate.scoreBreakdown?.[row.key] != null
                    )
                    .map((row) => {
                      const value = candidate.scoreBreakdown?.[row.key] ?? 0;
                      const tier = tierClasses[breakdownTier(row.key, value)];
                      const isAdj = row.key === "reputationAdjustment";
                      return (
                        <div key={row.key} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {row.label}
                            </span>
                            <span
                              className={cn(
                                "font-semibold tabular-nums",
                                tier.text
                              )}
                            >
                              {isAdj && value >= 0 ? "+" : ""}
                              {value.toFixed(1)}
                            </span>
                          </div>
                          {!isAdj && (
                            <Progress
                              value={Math.max(0, Math.min(100, value))}
                              className="h-1.5"
                              indicatorClassName={tier.bar}
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <div>
              <SectionLabel>Skills exigidas pelo projeto</SectionLabel>
              <div className="mt-2 flex flex-wrap gap-1">
                {data.requiredSkills.length > 0 ? (
                  data.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
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
                  {candidate.matchingSkills.length > 0 ? (
                    candidate.matchingSkills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-success/15 text-success w-fit"
                      >
                        <Check className="size-3" />
                        {skill}
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
                  {candidate.missingSkills.length > 0 ? (
                    candidate.missingSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="destructive"
                        className="w-fit"
                      >
                        <X className="size-3" />
                        {skill}
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
                  candidate.reputation != null ? (
                    <span className="flex items-center gap-1">
                      {candidate.reputation.toFixed(1)}
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
                    {candidate.experienceLevel
                      ? (experienceLabels[candidate.experienceLevel] ??
                        candidate.experienceLevel)
                      : "—"}
                    {data.experienceLevelRequired != null &&
                      candidate.experienceLevel != null &&
                      (candidate.experienceLevel ===
                      data.experienceLevelRequired ? (
                        <Check className="text-success size-3.5" />
                      ) : (
                        <AlertTriangle className="text-warning size-3.5" />
                      ))}
                  </span>
                }
              />
              <InfoRow
                icon={Check}
                label="Disponível agora"
                value={candidate.available ? "Sim" : "Não"}
              />
              <InfoRow
                icon={Briefcase}
                label="Projetos anteriores"
                value={candidate.previousProjectsCount ?? 0}
              />
              <InfoRow
                icon={DollarSign}
                label="Pretensão do profissional"
                value={`${money(candidate.minimumSalary)} – ${money(candidate.maximumSalary)}`}
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

            <div>
              <SectionLabel>Detalhes da vaga</SectionLabel>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {isJob && project.contractType && (
                  <InfoRow
                    icon={FileText}
                    label="Tipo de contrato"
                    value={
                      contractTypeLabels[project.contractType] ??
                      project.contractType
                    }
                  />
                )}
                {isJob && project.workloadHoursPerWeek != null && (
                  <InfoRow
                    icon={Clock}
                    label="Carga horária"
                    value={`${project.workloadHoursPerWeek}h/semana`}
                  />
                )}
                {isJob && project.startDate && (
                  <InfoRow
                    icon={Calendar}
                    label="Início"
                    value={formatDate(project.startDate)}
                  />
                )}
                {!isJob && project.deadline && (
                  <InfoRow
                    icon={Calendar}
                    label="Prazo"
                    value={formatDate(project.deadline)}
                  />
                )}
                {project.maxPositions != null && (
                  <InfoRow
                    icon={Briefcase}
                    label="Posições"
                    value={`${project.filledPositions ?? 0}/${project.maxPositions}`}
                  />
                )}
              </div>
              {isJob && project.benefits && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {project.benefits.split(",").map((benefit) => (
                    <Badge
                      key={benefit}
                      variant="outline"
                      className="text-[11px]"
                    >
                      {benefit.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {canShowInterest && (
              <div className="flex justify-end border-t pt-3">
                <Button
                  size="sm"
                  disabled={showInterestPending}
                  onClick={handleShowInterest}
                >
                  <Handshake className="size-4" />
                  {showInterestPending ? "Enviando…" : "Demonstrar interesse"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
