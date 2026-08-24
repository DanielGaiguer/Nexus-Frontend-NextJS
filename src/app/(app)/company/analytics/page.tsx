"use client";

import { CompanyAnalyticsView } from "@/components/analytics/company-analytics-view";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyDashboard } from "@/hooks/queries/useCompanyDashboard";

export default function CompanyAnalyticsPage() {
  const { data, isLoading, isError } = useCompanyDashboard();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Visão analítica do seu desempenho na plataforma
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

      {data && <CompanyAnalyticsView data={data} />}
    </div>
  );
}
