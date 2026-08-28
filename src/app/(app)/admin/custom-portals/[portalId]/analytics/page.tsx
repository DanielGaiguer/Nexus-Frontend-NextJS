"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { PortalAnalyticsView } from "@/components/custom-portal/portal-analytics-view";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCustomPortalAnalytics,
  type AnalyticsRange,
} from "@/hooks/queries/useCustomPortalAnalytics";
import { useAdminCustomPortalDetail } from "@/hooks/queries/useAdminCustomPortals";

export default function AdminCustomPortalAnalyticsPage() {
  const params = useParams<{ portalId: string }>();
  const portalId = Number(params.portalId);
  const detail = useAdminCustomPortalDetail(portalId);

  const [days, setDays] = useState<AnalyticsRange>(30);
  const analytics = useAdminCustomPortalAnalytics(portalId, days);

  const portal = detail.data?.portal;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <Link
          href="/admin/custom-portals"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Plataformas personalizadas
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {portal ? `Análises — ${portal.companyName}` : "Análises"}
        </h1>
        {portal && (
          <p className="text-muted-foreground text-sm">
            {portal.subdomain}.nexus.com.br
          </p>
        )}
      </div>

      {detail.isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <PortalAnalyticsView
          data={analytics.data}
          days={days}
          onDaysChange={setDays}
          isLoading={analytics.isLoading}
          intro={`Acessos à página pública desta plataforma nos últimos ${days} dias.`}
          emptyTitle="Esta plataforma ainda não registrou visitas"
          emptyDescription="Nenhum acesso foi registrado no período selecionado. Assim que a página pública receber visitas, as métricas aparecem aqui."
        />
      )}
    </div>
  );
}
