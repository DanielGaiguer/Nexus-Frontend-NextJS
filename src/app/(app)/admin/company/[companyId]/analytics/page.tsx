"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { CompanyAnalyticsView } from "@/components/analytics/company-analytics-view";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCompanyAnalytics } from "@/hooks/queries/useAdminAnalytics";
import { useAdminCompanyProfile } from "@/hooks/queries/useAdminCompanyView";

/** Reaproveita o mesmo CompanyAnalyticsView de /company/analytics — só a fonte do dado muda (endpoint por id, só admin). */
export default function AdminCompanyAnalyticsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const id = Number(companyId);
  const router = useRouter();

  const { data: profile } = useAdminCompanyProfile(id);
  const { data, isLoading, isError } = useAdminCompanyAnalytics(id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold tracking-tight">
          Analytics {profile ? `— ${profile.companyName}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">
          Visão somente leitura do administrador
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
            Não foi possível carregar os dados analíticos.
          </CardContent>
        </Card>
      )}

      {data && <CompanyAnalyticsView data={data} />}
    </div>
  );
}
