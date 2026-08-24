import {
  BarChart3,
  Check,
  Clock,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfessionalDashboardAnalyticsDTO } from "@/types/analytics";

import {
  AcceptanceRateChart,
  type AcceptanceRateDatum,
} from "./acceptance-rate-chart";
import {
  AcceptanceRateTable,
  type AcceptanceRateRow,
} from "./acceptance-rate-table";
import { MatchesTrendChart } from "./matches-trend-chart";
import { ReputationDetailCard } from "./reputation-detail-card";
import { ScoreDistributionChart } from "./score-distribution-chart";
import { SkillDemandChart } from "./skill-demand-chart";
import { SkillGapChart } from "./skill-gap-chart";
import { SoftSkillFeedbackChart } from "./soft-skill-feedback-chart";

/**
 * Conteúdo completo do dashboard analítico do profissional — usado tanto
 * em /pro/analytics (visão do próprio profissional) quanto na visão
 * somente leitura do admin, para as duas nunca mais divergirem entre si
 * (e para bater com pro-analytics.html do app antigo: mesmas seções,
 * mesmos tipos de gráfico, mesmos dados).
 */
export function ProfessionalAnalyticsView({
  data,
}: {
  data: ProfessionalDashboardAnalyticsDTO;
}) {
  const companyRates: AcceptanceRateDatum[] = data.acceptanceRatePerCompany.map(
    (c) => ({
      key: String(c.companyId),
      label: c.companyName,
      acceptanceRate: c.acceptanceRate,
      confirmedMatches: c.confirmedMatches,
      rejectedMatches: c.rejectedMatches,
    })
  );

  const companyRows: AcceptanceRateRow[] = data.acceptanceRatePerCompany.map(
    (c) => ({
      id: c.companyId,
      name: c.companyName,
      totalMatches: c.totalMatches,
      confirmedMatches: c.confirmedMatches,
      rejectedMatches: c.rejectedMatches,
      acceptanceRate: c.acceptanceRate,
    })
  );

  const showSkillsRow =
    data.skillGaps.length > 0 || data.softSkillFeedback.length > 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          icon={Users}
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
          icon={Target}
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
                unitLabel="matches"
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
            <CardTitle className="text-sm">Aceitação por Contratante</CardTitle>
            <p className="text-muted-foreground text-xs">
              Taxa de aceitação e score médio por contratante
            </p>
          </CardHeader>
          <CardContent>
            {companyRates.length > 0 ? (
              <AcceptanceRateChart data={companyRates} />
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
              Minhas Skills Mais Demandadas
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Tecnologias mais presentes nos seus matches
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
        entity="professional"
      />

      {showSkillsRow && (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.skillGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">HardSkills</CardTitle>
                <p className="text-muted-foreground text-xs">
                  Indicações de aprendizado baseado em competências técnicas que
                  aprimorariam o seu perfil.
                </p>
              </CardHeader>
              <CardContent>
                <SkillGapChart data={data.skillGaps} />
              </CardContent>
            </Card>
          )}

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
        </div>
      )}

      {companyRows.length > 0 && (
        <Card className="gap-0 py-0">
          <CardHeader className="flex-row items-center justify-between border-b py-4">
            <CardTitle className="text-sm">
              Desempenho por Contratante
            </CardTitle>
            <span className="text-muted-foreground text-xs">
              {companyRows.length} contratante(s)
            </span>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <AcceptanceRateTable rows={companyRows} nameHeader="Contratante" />
          </CardContent>
        </Card>
      )}
    </>
  );
}
