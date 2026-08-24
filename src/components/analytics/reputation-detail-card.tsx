"use client";

import { Award, ShieldCheck, Star } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReputationSummaryDTO } from "@/types/analytics";

import { ReputationGauge } from "./reputation-gauge";
import { ReputationRadarChart } from "./reputation-radar-chart";

/** Mesma cópia do card "Reputação Detalhada" no dashboard antigo, que varia
 * só o sujeito (empresa vs. você) entre company-analytics.html e pro-analytics.html. */
const EMPTY_DESCRIPTION = {
  company:
    "Assim que você receber avaliações, os indicadores de reputação aparecerão aqui.",
  professional:
    "Assim que você receber avaliações, seus indicadores de reputação aparecerão aqui.",
} as const;

/**
 * Card "Reputação Detalhada" completo: gauge + índice + barra de confiança,
 * radar dos 4 eixos e os 3 destaques (total de avaliações, satisfação,
 * recomendariam) — mesmo layout de 3 colunas do dashboard antigo
 * (col-lg-3 / col-lg-5 / col-lg-4), reaproveitado por empresa e profissional
 * (próprio dashboard e visão admin) para não voltar a divergir entre telas.
 */
export function ReputationDetailCard({
  reputation,
  entity,
}: {
  reputation: ReputationSummaryDTO;
  entity: "company" | "professional";
}) {
  const hasReviews = (reputation.totalReviews ?? 0) > 0;
  const confidence = Math.min(
    Math.max(reputation.confidenceScore ?? 0, 0),
    100
  );

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="text-sm">Reputação Detalhada</CardTitle>
          {hasReviews && (
            <p className="text-muted-foreground text-xs">
              Calculada a partir das {reputation.totalReviews} avaliações
              recebidas
            </p>
          )}
        </div>
        {hasReviews && (
          <div className="text-right">
            <Badge variant="secondary" className="shrink-0">
              <ShieldCheck className="size-3" />
              {confidence.toFixed(1)}% de confiança
            </Badge>
            <p className="text-muted-foreground mt-1 text-[11px]">
              Baseado em {reputation.totalReviews} avaliações
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {hasReviews ? (
          <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="flex flex-col items-center gap-3 lg:col-span-3">
              <ReputationGauge score={reputation.overallReputation ?? 0} />
              <div className="w-full max-w-[180px] space-y-1">
                <div className="bg-muted h-1 rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <p className="text-muted-foreground text-center text-[11px]">
                  Confiança: {confidence.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <ReputationRadarChart reputation={reputation} />
            </div>

            <div className="grid grid-cols-3 gap-2 lg:col-span-4 lg:grid-cols-1">
              <div className="bg-primary/5 rounded-md border p-3 text-center lg:text-left">
                <div className="text-muted-foreground text-[10px] tracking-wide uppercase">
                  Total de avaliações
                </div>
                <div className="text-lg font-bold tabular-nums">
                  {reputation.totalReviews}
                </div>
              </div>
              <div className="bg-warning/5 rounded-md border p-3 text-center lg:text-left">
                <div className="text-muted-foreground text-[10px] tracking-wide uppercase">
                  Satisfação média
                </div>
                <div className="text-warning flex items-center justify-center gap-1 text-lg font-bold tabular-nums lg:justify-start">
                  <Star className="fill-warning size-3.5" />
                  {((reputation.satisfactionAverage ?? 0) * 20).toFixed(1)}
                  <span className="text-muted-foreground text-xs font-normal">
                    / 100
                  </span>
                </div>
              </div>
              <div className="bg-success/5 rounded-md border p-3 text-center lg:text-left">
                <div className="text-muted-foreground text-[10px] tracking-wide uppercase">
                  Recomendariam
                </div>
                <div className="text-success text-lg font-bold tabular-nums">
                  {(reputation.recommendationRate ?? 0).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Award}
            title="Ainda sem avaliações suficientes"
            description={EMPTY_DESCRIPTION[entity]}
            className="py-8"
          />
        )}
      </CardContent>
    </Card>
  );
}
