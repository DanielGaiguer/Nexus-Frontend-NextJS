"use client";

import {
  Award,
  BarChart3,
  Check,
  Clock,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { AcceptanceRateList } from "@/components/professional/acceptance-rate-list";
import { MatchesTrendChart } from "@/components/professional/matches-trend-chart";
import { ReputationRadarChart } from "@/components/professional/reputation-radar-chart";
import { ScoreDistributionChart } from "@/components/professional/score-distribution-chart";
import { SkillDemandChart } from "@/components/professional/skill-demand-chart";
import { SoftSkillFeedbackChart } from "@/components/professional/soft-skill-feedback-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
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
import { useProfessionalDashboard } from "@/hooks/queries/useProfessionalDashboard";

export default function ProAnalyticsPage() {
  const { data, isLoading, isError } = useProfessionalDashboard();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Suas métricas pessoais de compatibilidade e reputação.
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Distribuição de Score</CardTitle>
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Aceitação por Empresa</CardTitle>
                <p className="text-muted-foreground text-xs">
                  Taxa de aceitação e score médio por empresa
                </p>
              </CardHeader>
              <CardContent>
                {data.acceptanceRatePerCompany.length > 0 ? (
                  <AcceptanceRateList data={data.acceptanceRatePerCompany} />
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
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-sm">Reputação Detalhada</CardTitle>
                  {!!data.reputationSummary.totalReviews && (
                    <p className="text-muted-foreground text-xs">
                      Calculada a partir das{" "}
                      {data.reputationSummary.totalReviews} avaliações recebidas
                    </p>
                  )}
                </div>
                {!!data.reputationSummary.totalReviews && (
                  <Badge variant="secondary" className="shrink-0">
                    <ShieldCheck className="size-3" />
                    {(data.reputationSummary.confidenceScore ?? 0).toFixed(1)}%
                    de confiança
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {data.reputationSummary.totalReviews ? (
                  <div className="space-y-4">
                    <ReputationRadarChart reputation={data.reputationSummary} />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-primary/5 rounded-md border p-2 text-center">
                        <div className="text-muted-foreground text-[10px] uppercase">
                          Avaliações
                        </div>
                        <div className="text-sm font-bold tabular-nums">
                          {data.reputationSummary.totalReviews}
                        </div>
                      </div>
                      <div className="bg-warning/5 rounded-md border p-2 text-center">
                        <div className="text-muted-foreground text-[10px] uppercase">
                          Satisfação
                        </div>
                        <div className="text-warning flex items-center justify-center gap-1 text-sm font-bold tabular-nums">
                          <Star className="fill-warning size-3" />
                          {(
                            (data.reputationSummary.satisfactionAverage ?? 0) *
                            20
                          ).toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-success/5 rounded-md border p-2 text-center">
                        <div className="text-muted-foreground text-[10px] uppercase">
                          Recomendam
                        </div>
                        <div className="text-success text-sm font-bold tabular-nums">
                          {(
                            data.reputationSummary.recommendationRate ?? 0
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Award}
                    title="Ainda sem avaliações suficientes"
                    description="Assim que você receber avaliações, seus indicadores de reputação aparecerão aqui."
                    className="py-8"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {data.acceptanceRatePerCompany.length > 0 && (
            <Card className="gap-0 py-0">
              <CardHeader className="flex-row items-center justify-between border-b py-4">
                <CardTitle className="text-sm">
                  Desempenho por Empresa
                </CardTitle>
                <span className="text-muted-foreground text-xs">
                  {data.acceptanceRatePerCompany.length} empresa(s)
                </span>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Confirmados</TableHead>
                        <TableHead>Pendentes</TableHead>
                        <TableHead>Rejeitados</TableHead>
                        <TableHead>Taxa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.acceptanceRatePerCompany.map((cr) => {
                        const pending = Math.max(
                          0,
                          cr.totalMatches -
                            cr.confirmedMatches -
                            cr.rejectedMatches
                        );
                        return (
                          <TableRow key={cr.companyId}>
                            <TableCell className="font-medium">
                              {cr.companyName}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {cr.totalMatches}
                            </TableCell>
                            <TableCell className="text-success tabular-nums">
                              {cr.confirmedMatches}
                            </TableCell>
                            <TableCell className="text-warning tabular-nums">
                              {pending}
                            </TableCell>
                            <TableCell className="text-destructive tabular-nums">
                              {cr.rejectedMatches}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  cr.acceptanceRate >= 60
                                    ? "bg-success/15 text-success"
                                    : cr.acceptanceRate >= 30
                                      ? "bg-warning/15 text-warning"
                                      : "bg-destructive/15 text-destructive"
                                }
                              >
                                {cr.acceptanceRate.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {data.skillGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">HardSkills</CardTitle>
                <p className="text-muted-foreground text-xs">
                  Indicações de aprendizado baseado em competências técnicas que
                  aprimorariam o seu perfil.
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {data.skillGaps.map((gap) => (
                  <Badge key={gap.skillName} variant="outline">
                    {gap.skillName} · {gap.frequency}
                  </Badge>
                ))}
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
        </>
      )}
    </div>
  );
}
