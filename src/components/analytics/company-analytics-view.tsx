import { BarChart3, Check, Clock, Star, TrendingUp, X } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  CompanyDashboardAnalyticsDTO,
  ProjectAcceptanceRateDTO,
} from "@/types/analytics";

import {
  AcceptanceRateChart,
  type AcceptanceRateDatum,
} from "./acceptance-rate-chart";
import {
  AcceptanceRateTable,
  type AcceptanceRateRow,
} from "./acceptance-rate-table";
import { MatchesTrendChart } from "./matches-trend-chart";
import { ProjectStatusChart } from "./project-status-chart";
import { ReputationDetailCard } from "./reputation-detail-card";
import { ScoreDistributionChart } from "./score-distribution-chart";
import { SkillDemandChart } from "./skill-demand-chart";
import { SoftSkillFeedbackChart } from "./soft-skill-feedback-chart";

function toRow(p: ProjectAcceptanceRateDTO): AcceptanceRateRow {
  return {
    id: p.projectId,
    name: p.projectTitle,
    totalMatches: p.totalMatches,
    confirmedMatches: p.confirmedMatches,
    rejectedMatches: p.rejectedMatches,
    acceptanceRate: p.acceptanceRate,
  };
}

/**
 * Conteúdo completo do dashboard analítico da empresa — usado tanto em
 * /company/analytics (visão da própria empresa) quanto na visão somente
 * leitura do admin, para as duas nunca mais divergirem entre si (e para
 * bater com company-analytics.html do app antigo: mesmas seções, mesmos
 * tipos de gráfico, mesmos dados).
 */
export function CompanyAnalyticsView({
  data,
}: {
  data: CompanyDashboardAnalyticsDTO;
}) {
  const projectRates: AcceptanceRateDatum[] = data.acceptanceRatePerProject.map(
    (p) => ({
      key: String(p.projectId),
      label: p.projectTitle,
      acceptanceRate: p.acceptanceRate,
      confirmedMatches: p.confirmedMatches,
      rejectedMatches: p.rejectedMatches,
    })
  );

  const projectRows = data.acceptanceRatePerProject
    .filter((p) => p.opportunityType === "PROJECT")
    .map(toRow);
  const jobRows = data.acceptanceRatePerProject
    .filter((p) => p.opportunityType === "JOB")
    .map(toRow);

  const showSkillsRow =
    data.softSkillFeedback.length > 0 ||
    data.projectStatusDistribution.length > 0;

  return (
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

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4" />
              Matches por mês
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribuição de Score</CardTitle>
          </CardHeader>
          <CardContent>
            {data.scoreDistribution.length > 0 ? (
              <ScoreDistributionChart
                data={data.scoreDistribution}
                unitLabel="candidatos"
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
      </div>

      <div className="grid gap-4 lg:grid-cols-[7fr_5fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Aceitação por Projeto</CardTitle>
            <p className="text-muted-foreground text-xs">
              Taxa de aceitação e score médio por projeto
            </p>
          </CardHeader>
          <CardContent>
            {projectRates.length > 0 ? (
              <AcceptanceRateChart data={projectRates} />
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
            <CardTitle className="text-sm">Skills Mais Exigidas</CardTitle>
            <p className="text-muted-foreground text-xs">
              Tecnologias que você mais demanda
            </p>
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
      </div>

      <ReputationDetailCard
        reputation={data.reputationSummary}
        entity="company"
      />

      {showSkillsRow && (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.softSkillFeedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">SoftSkills</CardTitle>
                <p className="text-muted-foreground text-xs">
                  Indicações de aprimoramento de habilidades comportamentais
                  baseadas em avaliações recebidas.
                </p>
              </CardHeader>
              <CardContent>
                <SoftSkillFeedbackChart data={data.softSkillFeedback} />
              </CardContent>
            </Card>
          )}

          {data.projectStatusDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status de Vagas</CardTitle>
                <p className="text-muted-foreground text-xs">
                  Distribuição dos seus projetos e vagas por situação atual.
                </p>
              </CardHeader>
              <CardContent>
                <ProjectStatusChart data={data.projectStatusDistribution} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="gap-0 py-0">
        <CardHeader className="flex-row items-center justify-between border-b py-4">
          <CardTitle className="text-sm">Desempenho por Projeto</CardTitle>
          <span className="text-muted-foreground text-xs">
            {projectRows.length} projeto(s)
          </span>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {projectRows.length > 0 ? (
            <AcceptanceRateTable rows={projectRows} nameHeader="Projeto" />
          ) : (
            <p className="text-muted-foreground px-6 py-4 text-sm">
              Nenhum projeto com matches ainda.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="flex-row items-center justify-between border-b py-4">
          <CardTitle className="text-sm">Desempenho por Vaga</CardTitle>
          <span className="text-muted-foreground text-xs">
            {jobRows.length} vaga(s)
          </span>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {jobRows.length > 0 ? (
            <AcceptanceRateTable rows={jobRows} nameHeader="Vaga" />
          ) : (
            <p className="text-muted-foreground px-6 py-4 text-sm">
              Nenhuma vaga com matches ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
