"use client";

import { BarChart3, Eye, MousePointerClick, Timer, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  DonutChart,
  type DonutDatum,
} from "@/components/analytics/donut-chart";
import { PortalConversionGauge } from "@/components/custom-portal/portal-conversion-gauge";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsRange } from "@/hooks/queries/useCustomPortalAnalytics";
import type { CustomPortalAnalyticsDTO } from "@/types/custom-portal";

const PALETTE = [
  "var(--nexus-primary)",
  "var(--nexus-accent)",
  "var(--nexus-success)",
  "var(--nexus-warning)",
  "var(--nexus-secondary)",
  "#f472b6",
];

const RANGES: AnalyticsRange[] = [7, 30, 90];

const viewsConfig = {
  views: { label: "Acessos", color: "var(--nexus-primary)" },
} satisfies ChartConfig;

function formatDay(iso: string) {
  const [y, m, d] = iso.split("-");
  return d ? `${d}/${m}` : (y ?? iso);
}

function formatDuration(seconds: number) {
  const s = Math.round(seconds);
  if (s <= 0) return "—";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

export function PortalAnalyticsView({
  data,
  days,
  onDaysChange,
  isLoading,
  intro,
  emptyTitle = "Ainda não há visitas registradas",
  emptyDescription = "Compartilhe o endereço da sua plataforma para começar a receber acessos — as métricas aparecem aqui automaticamente.",
}: {
  data: CustomPortalAnalyticsDTO | undefined;
  days: AnalyticsRange;
  onDaysChange: (days: AnalyticsRange) => void;
  isLoading: boolean;
  /** Texto no topo (esquerda do seletor de período). Default: cópia do contratante. */
  intro?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const rangeSelector = (
    <div className="flex gap-1">
      {RANGES.map((r) => (
        <Button
          key={r}
          size="sm"
          variant={r === days ? "default" : "outline"}
          onClick={() => onDaysChange(r)}
        >
          {r} dias
        </Button>
      ))}
    </div>
  );

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">{rangeSelector}</div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  const noData = data.totalViews === 0;
  const viewsData = data.viewsPerDay.map((d) => ({
    label: formatDay(d.date),
    views: d.views,
  }));
  const topDonut: DonutDatum[] = data.topOpportunities.map((o, i) => ({
    key: String(o.opportunityId),
    label: o.title,
    value: o.views,
    color: PALETTE[i % PALETTE.length],
  }));
  const refDonut: DonutDatum[] = data.referrers.map((r, i) => ({
    key: r.label,
    label: r.label,
    value: r.count,
    color: PALETTE[i % PALETTE.length],
  }));
  const acessos = (n: number) => `${n} ${n === 1 ? "acesso" : "acessos"}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {intro ??
            `Métricas da página pública nos últimos ${data.rangeDays} dias.`}
        </p>
        {rangeSelector}
      </div>

      {noData ? (
        <EmptyState
          icon={BarChart3}
          title={emptyTitle}
          description={emptyDescription}
          className="rounded-lg border"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={Eye}
              label="Acessos"
              value={String(data.totalViews)}
            />
            <StatCard
              icon={Users}
              label="Visitantes únicos"
              value={String(data.uniqueVisitors)}
              accent="accent"
            />
            <StatCard
              icon={MousePointerClick}
              label='Cliques em "Candidatar-se"'
              value={String(data.applyClicks)}
              accent="success"
            />
            <StatCard
              icon={Timer}
              label="Tempo médio na plataforma"
              value={formatDuration(data.avgSessionSeconds)}
              accent="warning"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Acessos por dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={viewsConfig} className="h-56 w-full">
                <AreaChart data={viewsData} margin={{ left: 4, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="views"
                    type="monotone"
                    fill="var(--color-views)"
                    fillOpacity={0.15}
                    stroke="var(--color-views)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taxa de conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <PortalConversionGauge rate={data.conversionRate} />
                <p className="text-muted-foreground mt-1 text-center text-xs">
                  {data.applyClicks} de {data.totalViews} acessos clicaram em
                  candidatar-se
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Vagas mais vistas</CardTitle>
              </CardHeader>
              <CardContent>
                {topDonut.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nenhum acesso a vagas específicas ainda.
                  </p>
                ) : (
                  <DonutChart
                    data={topDonut}
                    unitLabel={(d) => acessos(d.value)}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Origem do tráfego</CardTitle>
              </CardHeader>
              <CardContent>
                {refDonut.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Sem dados de origem ainda.
                  </p>
                ) : (
                  <DonutChart
                    data={refDonut}
                    unitLabel={(d) => acessos(d.value)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
