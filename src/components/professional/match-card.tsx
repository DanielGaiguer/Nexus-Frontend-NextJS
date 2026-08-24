import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
} from "lucide-react";
import type { ReactNode } from "react";

import { ScoreRing } from "@/components/professional/score-ring";
import { CompanyTypeBadge } from "@/components/shared/company-type-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { rejectionReasonLabels } from "@/types/match";
import type { MatchResponseDTO } from "@/types/match";

const breakdownLabels = {
  skills: "Skills",
  budget: "Orçamento",
  history: "Histórico",
  reputation: "Reputação",
} as const;

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

const experienceLevelLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function money(value: number | null | undefined) {
  return value != null
    ? value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      })
    : null;
}

export function MatchCard({
  match,
  mySkills,
  showScore = true,
  badge,
  actions,
}: {
  match: MatchResponseDTO;
  mySkills?: string[];
  showScore?: boolean;
  /** Selo de status específico do match (ex.: "Match Confirmado", aviso de expiração) — vai logo abaixo do nome da empresa. */
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  const { project } = match;
  const isJob = project.opportunityType === "JOB";
  const score = match.scoreBreakdown
    ? Math.round(match.scoreBreakdown.finalScore)
    : null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="size-12 shrink-0">
            <AvatarImage
              src={project.company?.profilePhotoUrl ?? undefined}
              alt=""
            />
            <AvatarFallback>
              {project.companyName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <div className="font-semibold">{project.title}</div>
              <Badge variant={isJob ? "default" : "secondary"} className="mt-1">
                {isJob ? (
                  <Building2 className="size-3" />
                ) : (
                  <Briefcase className="size-3" />
                )}
                {isJob ? "Vaga" : "Projeto"}
              </Badge>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1 text-sm">
                {project.companyName}
                <CompanyTypeBadge type={project.company?.type} />
                {project.createdAt && (
                  <>
                    <span className="text-muted-foreground/50">·</span>
                    <span className="text-xs">
                      Criado em {formatDate(project.createdAt)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {badge}

            {project.description && (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {project.description}
              </p>
            )}

            <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5" />
                {project.salaryVisible
                  ? isJob
                    ? (money(project.monthlySalaryMin) ?? "—") + "/mês"
                    : `${money(project.minimumBudget) ?? "—"} – ${money(project.maximumBudget) ?? "—"}`
                  : "A combinar"}
              </span>
              {project.workMode && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {modalityLabels[project.workMode] ?? project.workMode}
                </span>
              )}
              {isJob && project.contractType && (
                <span className="flex items-center gap-1">
                  <FileText className="size-3.5" />
                  {contractTypeLabels[project.contractType]}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {isJob
                  ? project.startDate
                    ? `Início previsto: ${formatDate(project.startDate)}`
                    : "Início não informado"
                  : project.deadline
                    ? `Entrega prevista: ${formatDate(project.deadline)}`
                    : "Prazo não informado"}
              </span>
              {project.experienceLevel && (
                <span className="flex items-center gap-1">
                  <Award className="size-3.5" />
                  {experienceLevelLabels[project.experienceLevel] ??
                    project.experienceLevel}
                </span>
              )}
            </div>

            {isJob && project.benefits && (
              <div className="flex flex-wrap gap-1">
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

            {project.requiredSkills.length > 0 && (
              <div>
                <div className="text-muted-foreground mb-1 text-[11px] tracking-wide uppercase">
                  Skills exigidas
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.requiredSkills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant={
                        mySkills?.includes(skill.name) ? "default" : "outline"
                      }
                      className="text-[11px]"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {match.rejectionReasons && match.rejectionReasons.length > 0 && (
              <div>
                <div className="text-muted-foreground mb-1 text-[11px] tracking-wide uppercase">
                  Motivos da rejeição
                </div>
                <div className="flex flex-wrap gap-1">
                  {match.rejectionReasons.map((reason) => (
                    <Badge
                      key={reason}
                      variant="outline"
                      className="text-[11px]"
                    >
                      {rejectionReasonLabels[reason] ?? reason}
                    </Badge>
                  ))}
                </div>
                {match.rejectionDescription && (
                  <p className="text-muted-foreground mt-1 text-xs whitespace-pre-wrap">
                    {match.rejectionDescription}
                  </p>
                )}
              </div>
            )}
          </div>

          {showScore && score != null && <ScoreRing score={score} size={84} />}
        </div>

        {match.scoreBreakdown && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3 sm:grid-cols-4">
            {(
              Object.keys(breakdownLabels) as (keyof typeof breakdownLabels)[]
            ).map((key) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {breakdownLabels[key]}
                  </span>
                  <span className="text-primary tabular-nums">
                    {Math.round(match.scoreBreakdown?.[key] ?? 0)}
                  </span>
                </div>
                <Progress
                  value={match.scoreBreakdown?.[key] ?? 0}
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {actions && (
        <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-3">
          {actions}
        </div>
      )}
    </Card>
  );
}
