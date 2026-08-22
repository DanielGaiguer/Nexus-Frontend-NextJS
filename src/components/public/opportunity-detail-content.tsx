"use client";

import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CircleCheck,
  Clock,
  Code2,
  DollarSign,
  Eye,
  FileText,
  Gift,
  MapPin,
  Send,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ScoreRing } from "@/components/professional/score-ring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useShowInterest } from "@/hooks/mutations/useShowInterest";
import { useOpportunities } from "@/hooks/queries/useOpportunities";
import { usePublicOpportunity } from "@/hooks/queries/usePublicOpportunity";
import { ApiError } from "@/lib/api-client";
import type { UserRole } from "@/types/auth";

const modalityLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

const experienceLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

const contractTypeLabels: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  INTERNSHIP: "Estágio",
  TEMPORARY: "Temporário",
  FREELANCER: "Freelancer",
};

function money(value: number | null) {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function OpportunityDetailContent({
  opportunityId,
  viewerRole,
}: {
  opportunityId: number;
  viewerRole: UserRole;
}) {
  const router = useRouter();
  const { data: project, isLoading } = usePublicOpportunity(opportunityId);
  const opportunities = useOpportunities();
  const showInterest = useShowInterest();

  const match =
    viewerRole === "PROFESSIONAL"
      ? opportunities.data?.find((m) => m.project.id === opportunityId)
      : undefined;
  const score = match?.scoreBreakdown
    ? Math.round(match.scoreBreakdown.finalScore)
    : null;

  // Espelha o `<a href="javascript:history.back()">Voltar</a>` do
  // opportunity-detail.html original — esta tela é alcançável de vários
  // lugares (feed de oportunidades, mapa, tabela do admin, ...), então o
  // botão precisa voltar pra onde a pessoa realmente veio, não pra um
  // destino fixo.
  const backButton = (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
    >
      <ArrowLeft className="size-4" />
      Voltar
    </button>
  );

  if (isLoading || !project) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        {backButton}
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const isJob = project.opportunityType === "JOB";
  const companyHref =
    project.company &&
    (viewerRole === "PROFESSIONAL"
      ? `/pro/companies/${project.company.id}`
      : viewerRole === "ADMIN"
        ? `/admin/company/${project.company.id}`
        : `/public/company/${project.company.id}`);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      {backButton}
      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 shrink-0 rounded-xl">
              <AvatarImage
                src={project.company?.profilePhotoUrl ?? undefined}
                alt=""
              />
              <AvatarFallback className="rounded-xl text-lg">
                {project.companyName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Badge variant={isJob ? "default" : "secondary"} className="mb-2">
                {isJob ? (
                  <Building2 className="size-3" />
                ) : (
                  <Briefcase className="size-3" />
                )}
                {isJob ? "Vaga de emprego" : "Projeto"}
              </Badge>
              <h1 className="text-xl font-bold tracking-tight">
                {project.title}
              </h1>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Building2 className="size-3.5" />
                  {project.companyName}
                </span>
                {project.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {project.city}
                    {project.uf ? ` / ${project.uf}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            {viewerRole === "PROFESSIONAL" &&
              (!match || match.status !== "PROFESSIONAL_INTERESTED" ? (
                <Button
                  disabled={showInterest.isPending}
                  onClick={() =>
                    showInterest.mutate(project.id, {
                      onSuccess: () => toast.success("Interesse enviado!"),
                      onError: (error) =>
                        toast.error(
                          error instanceof ApiError
                            ? error.message
                            : "Não foi possível demonstrar interesse."
                        ),
                    })
                  }
                >
                  <Send className="size-4" />
                  Demonstrar interesse
                </Button>
              ) : (
                <Button variant="ghost" disabled>
                  <CircleCheck className="size-4" />
                  Interesse demonstrado
                </Button>
              ))}
            {score != null && <ScoreRing score={score} size={80} />}
          </div>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow
                icon={DollarSign}
                label={isJob ? "Salário mensal" : "Faixa de budget"}
                value={
                  project.salaryVisible
                    ? isJob
                      ? `${money(project.monthlySalaryMin)} – ${money(project.monthlySalaryMax)}`
                      : `${money(project.minimumBudget)} – ${money(project.maximumBudget)}`
                    : "A combinar"
                }
              />
              {project.workMode && (
                <InfoRow
                  icon={MapPin}
                  label="Modalidade"
                  value={modalityLabels[project.workMode] ?? project.workMode}
                />
              )}
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
              {project.experienceLevel && (
                <InfoRow
                  icon={Award}
                  label="Nível de experiência"
                  value={
                    experienceLabels[project.experienceLevel] ??
                    project.experienceLevel
                  }
                />
              )}
              {project.workloadHoursPerWeek != null && (
                <InfoRow
                  icon={Clock}
                  label="Carga horária"
                  value={`${project.workloadHoursPerWeek}h/semana`}
                />
              )}
              {project.startDate && (
                <InfoRow
                  icon={Calendar}
                  label="Data de início"
                  value={new Date(project.startDate).toLocaleDateString(
                    "pt-BR"
                  )}
                />
              )}
              {project.deadline && (
                <InfoRow
                  icon={Calendar}
                  label="Prazo"
                  value={new Date(project.deadline).toLocaleDateString("pt-BR")}
                />
              )}
            </CardContent>
          </Card>

          {project.maxPositions != null && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Posições</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-primary text-2xl font-bold tabular-nums">
                  {project.filledPositions ?? 0}/{project.maxPositions}
                </div>
                <Progress
                  value={
                    ((project.filledPositions ?? 0) / project.maxPositions) *
                    100
                  }
                  className="h-1.5"
                />
              </CardContent>
            </Card>
          )}

          {project.salaryVisibleToProfessionals != null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Eye className="text-primary size-4" />
                  Visibilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <VisibilityRow
                  label="Visível para outras empresas"
                  value={project.visibleToCompanies ?? true}
                />
                <VisibilityRow
                  label="Salário/orçamento visível para profissionais"
                  value={project.salaryVisibleToProfessionals ?? false}
                />
                <VisibilityRow
                  label="Salário/orçamento visível para empresas"
                  value={project.salaryVisibleToCompanies ?? false}
                />
              </CardContent>
            </Card>
          )}

          {project.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Building2 className="text-primary size-4" />
                  Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {project.company.description && (
                  <p className="text-muted-foreground">
                    {project.company.description}
                  </p>
                )}
                {project.company.reputation != null &&
                project.company.reputation > 0 ? (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < Math.round(project.company!.reputation!)
                            ? "fill-warning text-warning size-3.5"
                            : "text-muted-foreground size-3.5"
                        }
                      />
                    ))}
                    <span className="ml-1 font-medium">
                      {project.company.reputation.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    Sem avaliações ainda
                  </span>
                )}
                {companyHref && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={companyHref}>Ver mais</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm whitespace-pre-line">
                {project.description || "Nenhuma descrição cadastrada."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Code2 className="size-4" />
                Skills exigidas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {project.requiredSkills.length > 0 ? (
                project.requiredSkills.map((skill) => (
                  <Badge key={skill.id}>{skill.name}</Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhuma skill exigida.
                </p>
              )}
            </CardContent>
          </Card>

          {project.benefits && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Gift className="size-4" />
                  Benefícios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm whitespace-pre-line">
                  {project.benefits}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function VisibilityRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          value
            ? "text-success font-semibold"
            : "text-destructive font-semibold"
        }
      >
        {value ? "Sim" : "Não"}
      </span>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="text-primary mt-0.5 size-4 shrink-0" />
      <div>
        <div className="text-muted-foreground text-xs">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
