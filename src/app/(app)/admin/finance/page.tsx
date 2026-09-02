"use client";

import {
  ArrowRight,
  BadgeCheck,
  FileWarning,
  Percent,
  Receipt,
  Repeat,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { MonthlyRevenueBarChart } from "@/components/finance/monthly-revenue-bar-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateCommissionPolicy } from "@/hooks/mutations/useCommissionPolicyActions";
import { useCommissionPolicy } from "@/hooks/queries/useCommissionPolicy";
import { useAdminFinanceOverview } from "@/hooks/queries/useFinance";
import { ApiError } from "@/lib/api-client";

// Curta para os cards de resumo. Abaixo de mil fica cheio ("R$ 940,00"); de mil
// pra cima abrevia ("R$ 1,8 mil" · "R$ 2,4 mi").
function brlShort(v: number) {
  if (Math.abs(v) < 1000) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

function parsePercent(raw: string): number | null {
  const n = Number(raw.trim().replace(",", "."));
  if (raw.trim() === "" || Number.isNaN(n) || n < 0 || n > 100) return null;
  return n;
}

export default function AdminFinancePage() {
  const { data, isLoading } = useAdminFinanceOverview();
  const { data: policy } = useCommissionPolicy();
  const updatePolicy = useUpdateCommissionPolicy();

  const [percent, setPercent] = useState("");
  const seededRef = useRef(false);
  useEffect(() => {
    if (policy && !seededRef.current) {
      setPercent(String(policy.percentage));
      seededRef.current = true;
    }
  }, [policy]);

  const parsed = parsePercent(percent);
  const dirty =
    policy != null && parsed !== null && parsed !== policy.percentage;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel financeiro</h1>
        <p className="text-muted-foreground text-sm">
          Receita de comissão sobre contratações fechadas e as filas do fluxo
          financeiro (confirmação → cobrança → nota fiscal).
        </p>
      </div>

      {data && !data.commissionLive && !data.simulated && (
        <Card>
          <CardContent className="text-muted-foreground text-sm">
            A cobrança de comissão está desligada nesta instância — nenhuma
            receita é gerada.
          </CardContent>
        </Card>
      )}
      {data?.simulated && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="text-sm">
            <span className="text-warning font-semibold">Modo de teste.</span>{" "}
            Os números abaixo refletem cobranças simuladas (sem Mercado Pago /
            eNotas).
          </CardContent>
        </Card>
      )}

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={Wallet}
              label="Receita arrecadada"
              value={brlShort(data.grossRevenue)}
              accent="success"
            />
            <StatCard
              icon={TrendingUp}
              label="Comissão em aberto"
              value={brlShort(data.pendingRevenue)}
              accent={data.pendingRevenue > 0 ? "warning" : "primary"}
            />
            <StatCard
              icon={BadgeCheck}
              label="Reconciliações pendentes"
              value={String(data.pendingReconciliationCount)}
              accent={
                data.pendingReconciliationCount > 0 ? "warning" : "primary"
              }
            />
            <StatCard
              icon={FileWarning}
              label="NFS-e pendentes"
              value={String(data.pendingNfseCount)}
              accent={data.pendingNfseCount > 0 ? "warning" : "primary"}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="size-4" />
                Receita de comissão por mês
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                {data.paidCount} cobrança(s) paga(s) · {data.issuedNfseCount}{" "}
                nota(s) emitida(s) · {data.blockedCompaniesCount} contratante(s)
                bloqueado(s)
              </p>
            </CardHeader>
            <CardContent>
              {data.monthlyRevenue.length > 0 ? (
                <MonthlyRevenueBarChart data={data.monthlyRevenue} />
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  Ainda sem comissões pagas.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Repeat className="size-4" />
                Mensalidades de plataforma personalizada
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                Receita recorrente, contada à parte da comissão.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
              <div className="flex gap-6">
                <div>
                  <div className="text-muted-foreground text-xs">Arrecadado</div>
                  <div className="text-success text-xl font-bold tabular-nums">
                    {brlShort(data.portalGrossRevenue)}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {data.portalPaidCount} mensalidade(s) paga(s)
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Em aberto</div>
                  <div className="text-xl font-bold tabular-nums">
                    {brlShort(data.portalPendingRevenue)}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {data.portalPendingCount} em aberto
                  </div>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:mb-1 sm:w-auto"
              >
                <Link href="/admin/portal-subscription-charges">
                  Ver mensalidades
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-3">
            <QueueCard
              icon={BadgeCheck}
              title="Reconciliação manual"
              count={data.pendingReconciliationCount}
              hint="Valores divergentes ou sem resposta"
              href="/admin/confirmations/reconciliation"
            />
            <QueueCard
              icon={FileWarning}
              title="Emissões fiscais"
              count={data.pendingNfseCount}
              hint="NFS-e que falharam ou aguardam"
              href="/admin/invoices?status=FAILED"
            />
            <QueueCard
              icon={Receipt}
              title="Cobranças"
              count={data.pendingCount}
              hint="Comissões pendentes / recusadas"
              href="/admin/commission-charges"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Percent className="text-primary size-4" />
                Percentual de comissão
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                Aplicado a partir da {data.freeHiresLimit + 1}ª contratação
                fechada de cada contratante.
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="w-full space-y-1.5 sm:w-32">
                <Label htmlFor="finance-percent">Comissão (%)</Label>
                <Input
                  id="finance-percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  inputMode="decimal"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  aria-invalid={percent.trim() !== "" && parsed === null}
                />
              </div>
              <Button
                className="flex-1 sm:flex-none"
                disabled={!dirty || updatePolicy.isPending}
                onClick={() => {
                  if (parsed === null) {
                    toast.error("Informe um percentual entre 0 e 100.");
                    return;
                  }
                  updatePolicy.mutate(
                    { percentage: parsed },
                    {
                      onSuccess: (saved) => {
                        setPercent(String(saved.percentage));
                        toast.success("Percentual de comissão atualizado!");
                      },
                      onError: (e) =>
                        toast.error(
                          e instanceof ApiError
                            ? e.message
                            : "Não foi possível salvar."
                        ),
                    }
                  );
                }}
              >
                {updatePolicy.isPending ? "Salvando…" : "Salvar"}
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/commission-policy">Detalhes</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function QueueCard({
  icon: Icon,
  title,
  count,
  hint,
  href,
}: {
  icon: typeof BadgeCheck;
  title: string;
  count: number;
  hint: string;
  href: string;
}) {
  return (
    <Card className={count > 0 ? "border-warning/40" : undefined}>
      <CardContent className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="size-4" />
            {title}
          </div>
          {count > 0 && (
            <Badge className="bg-warning/15 text-warning">{count}</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-xs">{hint}</p>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-auto self-start"
        >
          <Link href={href}>
            Abrir <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
