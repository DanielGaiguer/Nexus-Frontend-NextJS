"use client";

import { Percent } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommissionStatus } from "@/hooks/queries/useCommissionStatus";

function formatPercent(value: number) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

/**
 * Indicador de comissão na área do contratante (dashboard): quantas das
 * contratações gratuitas já foram usadas e se já entrou na faixa com comissão.
 *
 * Camada financeira, Prompt 1 — puramente informativo, nada é cobrado. O
 * contador vem do backend e hoje fica em 0 para todos; o Prompt 2 liga o
 * incremento ao evento da janela de confirmação.
 */
export function CommissionStatusCard() {
  const { data, isLoading } = useCommissionStatus();
  const limit = data?.freeHiresLimit ?? 3;
  const used = data ? Math.min(data.usedFreeHires, data.freeHiresLimit) : 0;

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between border-b py-4">
        <div>
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Percent className="text-primary size-4" />
            Contratações e comissão
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            Suas primeiras {limit} contratações fechadas com sucesso são
            gratuitas
          </p>
        </div>
        {data?.commissionApplies ? (
          <Badge className="bg-warning/15 text-warning">
            Comissão de {formatPercent(data.currentPercentage)}
          </Badge>
        ) : (
          <Badge variant="secondary">Período gratuito</Badge>
        )}
      </CardHeader>
      <CardContent className="py-4">
        {isLoading || !data ? (
          <Skeleton className="h-16" />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {used} de {limit} contratações gratuitas usadas
              </span>
              <span className="text-muted-foreground tabular-nums">
                {data.freeHiresRemaining} restante
                {data.freeHiresRemaining === 1 ? "" : "s"}
              </span>
            </div>
            <Progress value={(used / limit) * 100} />
            <p className="text-muted-foreground text-xs">
              {data.commissionApplies
                ? `Você já usou as contratações gratuitas. Novas contratações fechadas com sucesso entram na faixa com comissão de ${formatPercent(
                    data.currentPercentage
                  )} sobre o valor fechado. A cobrança ainda não está ativa.`
                : `A partir da ${
                    limit + 1
                  }ª contratação, passa a valer a comissão de ${formatPercent(
                    data.currentPercentage
                  )} sobre o valor fechado. Publicar oportunidade é sempre gratuito.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
