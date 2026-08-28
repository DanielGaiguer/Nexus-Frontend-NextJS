"use client";

import { AlertTriangle, Clock, ListChecks, Store } from "lucide-react";

import {
  DonutChart,
  type DonutDatum,
} from "@/components/analytics/donut-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  customPortalStatusLabel,
  type CustomPortalDTO,
  type CustomPortalRequestDTO,
} from "@/types/custom-portal";

const RENEWAL_WINDOW_DAYS = 7;

function daysUntil(isoDate: string): number {
  const due = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Resumo do módulo de plataformas personalizadas — reaproveita StatCard e
 * DonutChart do restante do admin (mesmas cores semânticas de status). Números
 * calculados das listas já carregadas; sem endpoint dedicado.
 */
export function CustomPortalSummary({
  portals,
  requests,
}: {
  portals: CustomPortalDTO[];
  requests: CustomPortalRequestDTO[];
}) {
  const active = portals.filter((p) => p.status === "ACTIVE");
  const suspended = portals.filter((p) => p.status === "SUSPENDED");
  const canceled = portals.filter((p) => p.status === "CANCELED");

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const overdue = portals.filter(
    (p) => p.paymentStatus === "OVERDUE" && p.status !== "CANCELED"
  ).length;
  const dueSoon = active.filter((p) => {
    const d = daysUntil(p.nextDueDate);
    return d >= 0 && d <= RENEWAL_WINDOW_DAYS;
  }).length;

  const donut: DonutDatum[] = [
    {
      key: "ACTIVE",
      label: customPortalStatusLabel.ACTIVE,
      value: active.length,
      color: "var(--nexus-success)",
    },
    {
      key: "SUSPENDED",
      label: customPortalStatusLabel.SUSPENDED,
      value: suspended.length,
      color: "var(--nexus-warning)",
    },
    {
      key: "CANCELED",
      label: customPortalStatusLabel.CANCELED,
      value: canceled.length,
      color: "var(--nexus-danger)",
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Store}
          label="Plataformas ativas"
          value={String(active.length)}
          accent="success"
        />
        <StatCard
          icon={ListChecks}
          label="Solicitações pendentes"
          value={String(pending)}
          accent="warning"
        />
        <StatCard
          icon={AlertTriangle}
          label="Pagamentos atrasados"
          value={String(overdue)}
          accent="warning"
        />
        <StatCard
          icon={Clock}
          label="Vencendo em 7 dias"
          value={String(dueSoon)}
        />
      </div>

      {donut.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Plataformas por status</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={donut}
              height={160}
              unitLabel={(d) =>
                `${d.value} ${d.value === 1 ? "plataforma" : "plataformas"}`
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
