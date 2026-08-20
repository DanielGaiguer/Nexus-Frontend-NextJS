"use client";

import { Award, Handshake, ThumbsUp, TrendingUp } from "lucide-react";

import { MonthlyMatchesBars } from "@/components/dashboard/monthly-matches-bars";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyDashboard } from "@/hooks/queries/useCompanyDashboard";
import { useCompanyProfile } from "@/hooks/queries/useCompanyProfile";

export default function CompanyDashboardPage() {
  const profile = useCompanyProfile();
  const dashboard = useCompanyDashboard();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {profile.data ? (
            <>Olá, {profile.data.companyName} 👋</>
          ) : (
            <Skeleton className="h-8 w-56" />
          )}
        </h1>
        <p className="text-muted-foreground text-sm">
          Bem-vindo de volta ao Nexus.
        </p>
      </div>

      {dashboard.isLoading && <DashboardSkeleton />}

      {dashboard.isError && (
        <Card>
          <CardContent className="text-destructive text-sm">
            Não foi possível carregar seus dados agora. Tente recarregar a
            página.
          </CardContent>
        </Card>
      )}

      {dashboard.data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={Handshake}
              label="Total de matches"
              value={String(dashboard.data.matchSummary.totalMatches)}
            />
            <StatCard
              icon={ThumbsUp}
              label="Matches confirmados"
              value={String(dashboard.data.matchSummary.confirmedMatches)}
              accent="success"
            />
            <StatCard
              icon={TrendingUp}
              label="Taxa de aceitação"
              value={`${dashboard.data.matchSummary.overallAcceptanceRate.toFixed(0)}%`}
              accent="accent"
            />
            <StatCard
              icon={Award}
              label="Reputação geral"
              value={
                dashboard.data.reputationSummary.overallReputation != null
                  ? dashboard.data.reputationSummary.overallReputation.toFixed(
                      1
                    )
                  : "—"
              }
              accent="secondary"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Matches por mês</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard.data.matchesPerMonth.length > 0 ? (
                  <MonthlyMatchesBars data={dashboard.data.matchesPerMonth} />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Ainda sem histórico suficiente.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills mais requisitadas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {dashboard.data.mostRequiredSkills.length > 0 ? (
                  dashboard.data.mostRequiredSkills.map((skill) => (
                    <Badge key={skill.skillName} variant="secondary">
                      {skill.skillName} · {skill.projectCount}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhum dado de demanda ainda.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}
