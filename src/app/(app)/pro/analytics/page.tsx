"use client";

import { ProfessionalAnalyticsView } from "@/components/analytics/professional-analytics-view";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

      {data && <ProfessionalAnalyticsView data={data} />}
    </div>
  );
}
