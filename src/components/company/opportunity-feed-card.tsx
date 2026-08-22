import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Eye,
  MapPin,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectResponseDTO } from "@/types/project";

const modalityLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

const projectTypeLabels: Record<string, string> = {
  FREELANCE: "Freelance",
  FULL_TIME: "Tempo integral",
  PART_TIME: "Meio período",
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

const statusBadge: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Aberto", className: "bg-success/15 text-success" },
  CLOSED: {
    label: "Encerrado",
    className: "bg-destructive/15 text-destructive",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-destructive/15 text-destructive",
  },
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

/**
 * Card da vitrine "Oportunidades da plataforma" (company-opportunities.html)
 * — mesmos campos do card de oportunidade do profissional, mas sem score
 * (empresa não tem compatibilidade com a vaga de outra empresa) e com um
 * único destino de ação: ver a empresa dona da oportunidade.
 */
export function OpportunityFeedCard({
  project,
}: {
  project: ProjectResponseDTO;
}) {
  const isJob = project.opportunityType === "JOB";
  const status = statusBadge[project.status] ?? {
    label: project.status,
    className: "bg-warning/15 text-warning",
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
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
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{project.title}</span>
                <Badge variant={isJob ? "default" : "secondary"}>
                  {isJob ? (
                    <Building2 className="size-3" />
                  ) : (
                    <Briefcase className="size-3" />
                  )}
                  {isJob ? "Vaga" : "Projeto"}
                </Badge>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </div>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1 text-sm">
                {project.companyName}
                <span className="text-muted-foreground/50">·</span>
                <span className="text-xs">
                  Criado em {formatDate(project.createdAt)}
                </span>
              </div>
            </div>

            {project.maxPositions != null && (
              <div className="shrink-0 text-right">
                <div className="text-muted-foreground text-[11px]">
                  Posições
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {project.filledPositions ?? 0}/{project.maxPositions}
                </div>
              </div>
            )}
          </div>

          {project.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {project.description}
            </p>
          )}

          <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1">
              <DollarSign
                className={`size-3.5 ${isJob ? "text-success" : "text-primary"}`}
              />
              {project.salaryVisible
                ? isJob
                  ? `${money(project.monthlySalaryMin) ?? "—"}/mês`
                  : `${money(project.minimumBudget) ?? "—"} – ${money(project.maximumBudget) ?? "—"}`
                : "A combinar"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="text-primary size-3.5" />
              {project.workMode
                ? (modalityLabels[project.workMode] ?? project.workMode)
                : "—"}
            </span>
            {project.type && (
              <span className="flex items-center gap-1">
                <Briefcase className="text-primary size-3.5" />
                {projectTypeLabels[project.type] ?? project.type}
                {isJob && project.contractType && (
                  <>
                    {" "}
                    ·{" "}
                    {contractTypeLabels[project.contractType] ??
                      project.contractType}
                  </>
                )}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="text-primary size-3.5" />
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
                <Award className="text-secondary size-3.5" />
                {experienceLevelLabels[project.experienceLevel] ??
                  project.experienceLevel}
              </span>
            )}
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
        </div>
      </CardContent>
      <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-3">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/public/opportunity/${project.id}`}>
            <Eye className="size-4" />
            Ver detalhes
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/public/company/${project.companyId}`}>
            <Building2 className="size-4" />
            Ver empresa
          </Link>
        </Button>
      </div>
    </Card>
  );
}
