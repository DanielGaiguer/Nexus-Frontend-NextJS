"use client";

import {
  Award,
  BarChart3,
  Check,
  Clock,
  Star,
  TrendingUp,
  X,
} from "lucide-react";

import { ProjectAcceptanceRateList } from "@/components/company/project-acceptance-rate-list";
import { ProjectStatusChart } from "@/components/company/project-status-chart";
import { MatchesTrendChart } from "@/components/professional/matches-trend-chart";
import { ReputationRadarChart } from "@/components/professional/reputation-radar-chart";
import { ScoreDistributionChart } from "@/components/professional/score-distribution-chart";
import { SkillDemandChart } from "@/components/professional/skill-demand-chart";
import { SoftSkillFeedbackChart } from "@/components/professional/soft-skill-feedback-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyDashboard } from "@/hooks/queries/useCompanyDashboard";

export default function CompanyAnalyticsPage() {
  const { data, isLoading, isError } = useCompanyDashboard();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Visão analítica do desempenho da sua empresa na plataforma
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="text-destructive text-sm">
            Não foi possível carregar suas métricas agora. Tente recarregar a
            página.
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard
              icon={TrendingUp}
              label="Total Matches"
              value={String(data.matchSummary.totalMatches)}
            />
            <StatCard
              icon={Check}
              label="Confirmados"
              value={String(data.matchSummary.confirmedMatches)}
              accent="success"
            />
            <StatCard
              icon={Clock}
              label="Pendentes"
              value={String(data.matchSummary.pendingMatches)}
              accent="warning"
            />
            <StatCard
              icon={X}
              label="Rejeitados"
              value={String(data.matchSummary.rejectedMatches)}
            />
            <StatCard
              icon={BarChart3}
              label="Taxa Aceitação"
              value={`${data.matchSummary.overallAcceptanceRate.toFixed(1)}%`}
              accent="accent"
            />
            <StatCard
              icon={Star}
              label="Avaliações Recebidas"
              value={String(data.reputationSummary.totalReviews ?? 0)}
              accent="secondary"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="size-4" />
                Matches ao longo do tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.matchesPerMonth.length > 0 ? (
                <MatchesTrendChart data={data.matchesPerMonth} />
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="Ainda sem histórico suficiente"
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Distribuição de score</CardTitle>
              </CardHeader>
              <CardContent>
                {data.scoreDistribution.length > 0 ? (
                  <ScoreDistributionChart data={data.scoreDistribution} />
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="Nenhum dado ainda"
                    className="py-8"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Status das oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.projectStatusDistribution.length > 0 ? (
                  <ProjectStatusChart data={data.projectStatusDistribution} />
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="Nenhum dado ainda"
                    className="py-8"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Taxa de aceitação por oportunidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.acceptanceRatePerProject.length > 0 ? (
                  <ProjectAcceptanceRateList
                    data={data.acceptanceRatePerProject}
                  />
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="Nenhum dado ainda"
                    className="py-8"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Perfil de reputação</CardTitle>
              </CardHeader>
              <CardContent>
                {data.reputationSummary.totalReviews ? (
                  <ReputationRadarChart reputation={data.reputationSummary} />
                ) : (
                  <EmptyState
                    icon={Award}
                    title="Nenhuma avaliação ainda"
                    className="py-8"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Skills mais requisitadas nas suas vagas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.mostRequiredSkills.length > 0 ? (
                <SkillDemandChart data={data.mostRequiredSkills} />
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="Nenhum dado ainda"
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>

          {data.softSkillFeedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Pontos de atenção nas avaliações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SoftSkillFeedbackChart data={data.softSkillFeedback} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
