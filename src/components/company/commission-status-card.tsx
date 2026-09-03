"use client";

import { Percent } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCommissionStatus } from "@/hooks/queries/useCommissionStatus";

function formatPercent(value: number) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

/**
 * Indicador de comissão na área do contratante (dashboard): quantas das
 * contratações gratuitas já foram usadas e quantas ainda restam.
 *
 * Só aparece enquanto o contratante ainda tem contratação gratuita
 * (`freeHiresRemaining > 0`). Quando todas foram usadas — ou seja, já entrou
 * na faixa com comissão —, o card some do dashboard. Enquanto a consulta
 * carrega, `data` é indefinido e o card também não aparece.
 */
export function CommissionStatusCard() {
  const { data } = useCommissionStatus();

  if (!data || data.freeHiresRemaining <= 0) {
    return null;
  }

  const limit = data.freeHiresLimit;
  const used = Math.min(data.usedFreeHires, data.freeHiresLimit);

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b py-4">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Percent className="text-primary size-4" />
            Contratações e comissão
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            Suas primeiras {limit} contratações fechadas com sucesso são
            gratuitas
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Período gratuito
        </Badge>
      </CardHeader>
      <CardContent className="py-4">
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
            A partir da {limit + 1}ª contratação, passa a valer a comissão de{" "}
            {formatPercent(data.currentPercentage)} sobre o valor fechado.
            Publicar oportunidade é sempre gratuito.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
