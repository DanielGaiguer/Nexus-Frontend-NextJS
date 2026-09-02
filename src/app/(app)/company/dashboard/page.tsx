"use client";

import {
  Briefcase,
  Building2,
  FolderOpen,
  FolderX,
  Handshake,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BillingBlockBanner } from "@/components/billing/billing-block-banner";
import { CommissionStatusCard } from "@/components/company/commission-status-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PendingReviewDialog } from "@/components/matches/pending-review-dialog";
import { PendingStatusCheckDialog } from "@/components/matches/pending-status-check-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompanyDashboardBundle } from "@/hooks/queries/useCompanyDashboardBundle";
import { computeSuccessRate } from "@/hooks/queries/useCompanyDashboardSummary";
import type { Modality, ProjectResponseDTO } from "@/types/project";

const modalityLabels: Record<Modality, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

const statusBadgeClass: Record<string, string> = {
  OPEN: "bg-success/15 text-success",
  CLOSED: "bg-destructive/15 text-destructive",
  CANCELLED: "bg-destructive/15 text-destructive",
};

const statusLabels: Record<string, string> = {
  OPEN: "Aberto",
  CLOSED: "Encerrado",
  CANCELLED: "Cancelado",
};

function formatMoney(value: number) {
  // Espelha #numbers.formatDecimal(x,1,'COMMA',0,'POINT') do template
  // original: separador de milhar vírgula, sem casas decimais.
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatCreatedAt(iso: string) {
  return `Criado em ${new Date(iso).toLocaleDateString("pt-BR")}`;
}

export default function CompanyDashboardPage() {
  // Uma única request pra tudo que a tela precisa — o Route Handler
  // /api/company/dashboard/bundle faz o fan-out server-side em paralelo, e
  // o hook semeia o cache de cada query individual (perfil, projetos,
  // matches confirmados/anteriores, pendências) pra header, sidebar e os
  // diálogos abaixo reaproveitarem sem refetch.
  const bundle = useCompanyDashboardBundle();
  const data = bundle.data;

  const profile = data?.profile;
  const summary = data?.summary;

  const allProjects = data?.projects ?? [];
  const openProjects = allProjects.filter((p) => p.status === "OPEN");
  const totalProjects = summary?.totalProjects ?? allProjects.length;
  // Mesma "Taxa de sucesso" de company/profile (useCompanySuccessRate) --
  // antes cada tela calculava esse número do seu próprio jeito e podiam
  // divergir pra mesma empresa.
  const successRate = computeSuccessRate(
    summary?.totalProjects,
    data?.confirmedMatches,
    data?.previousMatches
  );

  const recentProjects = allProjects
    .filter((p) => p.opportunityType !== "JOB")
    .slice(0, 5);
  const recentJobs = allProjects
    .filter((p) => p.opportunityType === "JOB")
    .slice(0, 5);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PendingStatusCheckDialog />
      <PendingReviewDialog role="company" active={!data?.pendingStatusCheck} />
      <BillingBlockBanner />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {profile ? profile.companyName : <Skeleton className="h-8 w-56" />}
        </h1>
        <p className="text-muted-foreground text-sm">
          Visão geral do seu perfil no Nexus
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Total de Projetos"
          value={String(totalProjects)}
        />
        <StatCard
          icon={FolderOpen}
          label="Projetos Abertos"
          value={String(openProjects.length)}
          accent="accent"
        />
        <StatCard
          icon={Handshake}
          label="Matches Confirmados"
          value={String(summary?.totalMatches ?? 0)}
          accent="success"
        />
        <StatCard
          icon={TrendingUp}
          label="Taxa de Sucesso"
          value={successRate}
          accent="warning"
        />
      </div>

      <CommissionStatusCard />

      <RecentOpportunitiesCard
        title="Projetos Recentes"
        subtitle="Seus últimos projetos publicados"
        icon={Briefcase}
        iconClassName="text-primary"
        isLoading={bundle.isLoading}
        items={recentProjects}
        emptyTitle="Nenhum projeto publicado ainda"
        createLabel="Criar projeto"
        titleColumnLabel="Projeto"
        moneyColumnLabel="Orçamento"
        renderMoney={(p) =>
          p.minimumBudget != null && p.maximumBudget != null ? (
            <span className="text-primary font-semibold tabular-nums">
              R${formatMoney(p.minimumBudget)}–R${formatMoney(p.maximumBudget)}
            </span>
          ) : (
            <span className="text-muted-foreground">A combinar</span>
          )
        }
      />

      <RecentOpportunitiesCard
        title="Vagas Recentes"
        subtitle="Suas últimas vagas publicadas"
        icon={Building2}
        iconClassName="text-success"
        isLoading={bundle.isLoading}
        items={recentJobs}
        emptyTitle="Nenhuma vaga publicada ainda"
        createLabel="Criar vaga"
        titleColumnLabel="Vaga"
        moneyColumnLabel="Salário"
        renderMoney={(p) =>
          p.monthlySalaryMin != null ? (
            <span className="text-success font-semibold tabular-nums">
              R${formatMoney(p.monthlySalaryMin)}/mês
              {p.monthlySalaryMax != null &&
                `–R$${formatMoney(p.monthlySalaryMax)}`}
            </span>
          ) : (
            <span className="text-muted-foreground">A combinar</span>
          )
        }
      />
    </div>
  );
}

function RecentOpportunitiesCard({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  isLoading,
  items,
  emptyTitle,
  createLabel,
  titleColumnLabel,
  moneyColumnLabel,
  renderMoney,
}: {
  title: string;
  subtitle: string;
  icon: typeof Briefcase;
  iconClassName: string;
  isLoading: boolean;
  items: ProjectResponseDTO[];
  emptyTitle: string;
  createLabel: string;
  titleColumnLabel: string;
  moneyColumnLabel: string;
  renderMoney: (project: ProjectResponseDTO) => ReactNode;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b py-4">
        <div>
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Icon className={`size-4 ${iconClassName}`} />
            {title}
          </CardTitle>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
        <Link
          href="/company/projects"
          className="text-primary text-xs font-semibold hover:underline"
        >
          Ver todos
        </Link>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {isLoading ? (
          <Skeleton className="m-4 h-24" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderX}
            title={emptyTitle}
            className="py-10"
            action={
              <Button asChild size="sm">
                <Link href="/company/projects/new">
                  <Plus className="size-3.5" />
                  {createLabel}
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            {/* Mobile: lista de cards */}
            <div className="flex flex-col gap-2 p-4 md:hidden">
              {items.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-1.5 rounded-lg border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 font-medium break-words">
                      {project.title}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 ${
                        statusBadgeClass[project.status] ??
                        "bg-warning/15 text-warning"
                      }`}
                    >
                      {statusLabels[project.status] ?? project.status}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatCreatedAt(project.createdAt)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    {renderMoney(project)}
                    <span className="text-muted-foreground text-xs">
                      {project.workMode
                        ? modalityLabels[project.workMode]
                        : "Modalidade não informada"}
                    </span>
                  </div>
                  <Link
                    href={`/company/projects/${project.id}/ranking`}
                    className="text-primary pt-0.5 text-xs font-semibold hover:underline"
                  >
                    Ver ranking →
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop: tabela */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{titleColumnLabel}</TableHead>
                    <TableHead>{moneyColumnLabel}</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-muted-foreground text-xs">
                          {formatCreatedAt(project.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>{renderMoney(project)}</TableCell>
                      <TableCell>
                        {project.workMode
                          ? modalityLabels[project.workMode]
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            statusBadgeClass[project.status] ??
                            "bg-warning/15 text-warning"
                          }
                        >
                          {statusLabels[project.status] ?? project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/company/projects/${project.id}/ranking`}
                          className="text-primary text-xs font-semibold hover:underline"
                        >
                          Ver ranking
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
