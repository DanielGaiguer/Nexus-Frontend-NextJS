"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Clock,
  DollarSign,
  Eye,
  ListChecks,
  MousePointerClick,
  Store,
  Timer,
  Users,
} from "lucide-react";

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
import {
  customPortalStatusLabel,
  type AdminCustomPortalAnalyticsDTO,
} from "@/types/custom-portal";

const RANGES: AnalyticsRange[] = [7, 30, 90];

const PALETTE = [
  "var(--nexus-primary)",
  "var(--nexus-accent)",
  "var(--nexus-success)",
  "var(--nexus-warning)",
  "var(--nexus-secondary)",
  "#f472b6",
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "var(--nexus-success)",
  SUSPENDED: "var(--nexus-warning)",
  CANCELED: "var(--nexus-danger)",
};

const viewsConfig = {
  views: { label: "Acessos", color: "var(--nexus-primary)" },
} satisfies ChartConfig;

const portalViewsConfig = {
  views: { label: "Acessos", color: "var(--nexus-primary)" },
} satisfies ChartConfig;

const newPortalsConfig = {
  count: { label: "Novas plataformas", color: "var(--nexus-primary)" },
} satisfies ChartConfig;

function brl(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

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

const acessos = (n: number) => `${n} ${n === 1 ? "acesso" : "acessos"}`;

export function AdminPortalAnalyticsView({
  data,
  days,
  onDaysChange,
  isLoading,
}: {
  data: AdminCustomPortalAnalyticsDTO | undefined;
  days: AnalyticsRange;
  onDaysChange: (days: AnalyticsRange) => void;
  isLoading: boolean;
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (data.totalPortals === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">{rangeSelector}</div>
        <EmptyState
          icon={Store}
          title="Nenhuma plataforma personalizada ainda"
          description="Aprove uma solicitação ou crie uma plataforma para começar a ver métricas do módulo aqui."
          className="rounded-lg border"
        />
      </div>
    );
  }

  const sys = data.system;

  const statusDonut: DonutDatum[] = data.portalsByStatus
    .filter((s) => s.count > 0)
    .map((s) => ({
      key: s.status,
      label: customPortalStatusLabel[s.status],
      value: s.count,
      color: STATUS_COLORS[s.status] ?? "var(--nexus-primary)",
    }));

  const planDonut: DonutDatum[] = data.portalsByPlan
    .filter((p) => p.count > 0)
    .map((p, i) => ({
      key: p.planName,
      label: p.planName,
      value: p.count,
      color: PALETTE[i % PALETTE.length],
    }));

  const viewsData = sys.viewsPerDay.map((d) => ({
    label: formatDay(d.date),
    views: d.views,
  }));

  const topOppDonut: DonutDatum[] = sys.topOpportunities.map((o, i) => ({
    key: String(o.opportunityId),
    label: o.title,
    value: o.views,
    color: PALETTE[i % PALETTE.length],
  }));

  const refDonut: DonutDatum[] = sys.referrers.map((r, i) => ({
    key: r.label,
    label: r.label,
    value: r.count,
    color: PALETTE[i % PALETTE.length],
  }));

  const portalBars = data.topPortals.map((p) => ({
    label: p.subdomain,
    views: p.views,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Visão geral do módulo. Métricas de acesso consideram os últimos{" "}
          {data.rangeDays} dias; contadores e receita são o estado atual.
        </p>
        {rangeSelector}
      </div>

      {/* Operacional */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          icon={Store}
          label="Plataformas ativas"
          value={String(data.activePortals)}
          accent="success"
        />
        <StatCard
          icon={ListChecks}
          label="Solicitações pendentes"
          value={String(data.pendingRequests)}
          accent="warning"
        />
        <StatCard
          icon={AlertTriangle}
          label="Pagamentos atrasados"
          value={String(data.overduePayments)}
          accent="warning"
        />
        <StatCard
          icon={Clock}
          label="Vencendo em 7 dias"
          value={String(data.dueSoon)}
        />
        <StatCard
          icon={DollarSign}
          label="Receita recorrente / mês"
          value={brl(data.monthlyRecurringRevenue)}
          accent="primary"
        />
      </div>

      {/* Composição da carteira */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Plataformas por status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDonut.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem plataformas.</p>
            ) : (
              <DonutChart
                data={statusDonut}
                unitLabel={(d) =>
                  `${d.value} ${d.value === 1 ? "plataforma" : "plataformas"}`
                }
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Plataformas por plano</CardTitle>
          </CardHeader>
          <CardContent>
            {planDonut.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem plataformas.</p>
            ) : (
              <DonutChart
                data={planDonut}
                unitLabel={(d) =>
                  `${d.value} ${d.value === 1 ? "plataforma" : "plataformas"}`
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engajamento agregado */}
      <div className="mt-2">
        <h3 className="text-sm font-semibold">
          Engajamento — todas as plataformas
        </h3>
        <p className="text-muted-foreground text-xs">
          Soma dos acessos à página pública de todas as plataformas nos últimos{" "}
          {data.rangeDays} dias.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Eye} label="Acessos" value={String(sys.totalViews)} />
        <StatCard
          icon={Users}
          label="Visitantes únicos"
          value={String(sys.uniqueVisitors)}
          accent="accent"
        />
        <StatCard
          icon={MousePointerClick}
          label='Cliques em "Candidatar-se"'
          value={String(sys.applyClicks)}
          accent="success"
        />
        <StatCard
          icon={Timer}
          label="Tempo médio na plataforma"
          value={formatDuration(sys.avgSessionSeconds)}
          accent="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Acessos por dia (todas as plataformas)
          </CardTitle>
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
            <PortalConversionGauge rate={sys.conversionRate} />
            <p className="text-muted-foreground mt-1 text-center text-xs">
              {sys.applyClicks} de {sys.totalViews} acessos clicaram em
              candidatar-se
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vagas mais vistas</CardTitle>
          </CardHeader>
          <CardContent>
            {topOppDonut.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum acesso a vagas específicas ainda.
              </p>
            ) : (
              <DonutChart
                data={topOppDonut}
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
              <DonutChart data={refDonut} unitLabel={(d) => acessos(d.value)} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ranking de plataformas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Plataformas com mais acessos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topPortals.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="Nenhum acesso no período"
              description="Assim que as plataformas receberem visitas, o ranking aparece aqui."
            />
          ) : (
            <div className="flex flex-col gap-4">
              <ChartContainer
                config={portalViewsConfig}
                className="h-56 w-full"
              >
                <BarChart data={portalBars} margin={{ left: 4, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={54}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="views"
                    fill="var(--color-views)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ChartContainer>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-left text-xs">
                      <th className="pb-2 font-medium">Plataforma</th>
                      <th className="pb-2 text-right font-medium">Acessos</th>
                      <th className="pb-2 text-right font-medium">Cliques</th>
                      <th className="pb-2 text-right font-medium">Conversão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPortals.map((p) => (
                      <tr key={p.portalId} className="border-t">
                        <td className="py-2">
                          <div className="font-medium">{p.companyName}</div>
                          <div className="text-muted-foreground text-xs">
                            {p.subdomain}.nexus.com.br
                          </div>
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {p.views}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {p.applyClicks}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {p.conversionRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crescimento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Novas plataformas por mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={newPortalsConfig} className="h-52 w-full">
            <BarChart
              data={data.portalsCreatedPerMonth}
              margin={{ left: 4, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
