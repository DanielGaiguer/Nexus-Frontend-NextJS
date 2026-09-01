"use client";

import { useState } from "react";
import { toast } from "sonner";

import { CardBrick } from "@/components/company/card-brick";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSavePortalSubscriptionCard } from "@/hooks/mutations/usePortalSubscriptionActions";
import {
  usePortalSubscription,
  usePortalSubscriptionCharges,
} from "@/hooks/queries/usePortalSubscription";
import { ApiError } from "@/lib/api-client";
import {
  customPortalPaymentStatusLabel,
  portalSubscriptionChargeStatusLabel,
} from "@/types/custom-portal";

function money(v: number | null | undefined) {
  return (v ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dateOnly(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return d ? `${d}/${m}/${y}` : iso;
}

const chargeBadgeClass: Record<string, string> = {
  PAID: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  PROCESSING: "bg-warning/15 text-warning",
  PENDING: "bg-warning/15 text-warning",
  CANCELED: "bg-muted text-muted-foreground",
};

export function SubscriptionBillingCard() {
  const { data, isLoading } = usePortalSubscription();
  const { data: charges } = usePortalSubscriptionCharges(!!data?.hasPortal);
  const saveCard = useSavePortalSubscriptionCard();
  const [showBrick, setShowBrick] = useState(false);

  if (isLoading || !data) {
    return <Skeleton className="h-56" />;
  }

  if (!data.hasPortal) {
    return null;
  }

  if (!data.billingEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Assinatura & cobrança</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          A cobrança automática da mensalidade está desligada nesta instância.
        </CardContent>
      </Card>
    );
  }

  const overdue = data.paymentStatus === "OVERDUE";
  const suspended = data.portalStatus === "SUSPENDED";
  const canceled = data.portalStatus === "CANCELED";

  if (canceled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Assinatura & cobrança</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Esta plataforma foi descontinuada — não há mais cobrança de
          mensalidade.
        </CardContent>
      </Card>
    );
  }

  function handleToken(token: string) {
    return saveCard
      .mutateAsync(token)
      .then(() => {
        toast.success("Cartão da assinatura salvo.");
        setShowBrick(false);
      })
      .catch((e) => {
        toast.error(
          e instanceof ApiError
            ? e.message
            : "Não foi possível salvar o cartão."
        );
        throw e;
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
          Assinatura & cobrança
          {data.simulated && (
            <Badge variant="secondary" className="bg-warning/15 text-warning">
              Modo de teste
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-muted-foreground text-xs">Plano</div>
            <div className="font-medium">{data.planName ?? "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Mensalidade</div>
            <div className="font-medium tabular-nums">
              {money(data.planPrice)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">
              Próximo vencimento
            </div>
            <div className="font-medium">{dateOnly(data.nextDueDate)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Pagamento:</span>
          <Badge
            variant="secondary"
            className={
              overdue
                ? "bg-destructive/15 text-destructive"
                : "bg-success/15 text-success"
            }
          >
            {data.paymentStatus
              ? customPortalPaymentStatusLabel[data.paymentStatus]
              : "—"}
          </Badge>
        </div>

        {suspended && (
          <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border p-3 text-xs">
            Sua plataforma está <strong>fora do ar</strong> por falta de
            pagamento da mensalidade. Atualize o cartão abaixo — assim que a
            cobrança for aceita, ela volta ao ar automaticamente.
          </div>
        )}
        {overdue && !suspended && (
          <div className="border-warning/40 bg-warning/5 text-warning-foreground rounded-md border p-3 text-xs">
            A última cobrança da mensalidade falhou. Atualize o cartão até{" "}
            <strong>{dateOnly(data.paymentGraceUntil)}</strong> para não ter a
            plataforma suspensa.
          </div>
        )}

        <div className="rounded-md border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-muted-foreground text-xs">
                Cartão da assinatura
              </div>
              <div className="font-medium">
                {data.hasCard
                  ? `${data.cardBrand ?? "Cartão"} •••• ${data.cardLast4 ?? "----"}`
                  : "Nenhum cartão cadastrado"}
              </div>
            </div>
            <Button
              size="sm"
              variant={data.hasCard ? "outline" : "default"}
              onClick={() => setShowBrick((v) => !v)}
            >
              {showBrick
                ? "Cancelar"
                : data.hasCard
                  ? "Trocar cartão"
                  : "Cadastrar cartão"}
            </Button>
          </div>

          {showBrick && data.simulated && (
            <div className="mt-3">
              <p className="text-muted-foreground mb-2 text-xs">
                Modo de teste: o cartão é fictício. Clique para confirmar.
              </p>
              <Button
                size="sm"
                disabled={saveCard.isPending}
                onClick={() => handleToken("SIMULATED").catch(() => {})}
              >
                {saveCard.isPending ? "Salvando…" : "Usar cartão de teste"}
              </Button>
            </div>
          )}
          {showBrick && !data.simulated && (
            <div className="mt-3">
              <CardBrick
                publicKey={data.publicKey}
                containerId="mp-portal-card-brick"
                submitLabel="Salvar cartão da assinatura"
                onToken={handleToken}
              />
            </div>
          )}
        </div>

        {charges && charges.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{dateOnly(c.dueDate)}</TableCell>
                    <TableCell className="tabular-nums">
                      {money(c.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={chargeBadgeClass[c.status] ?? ""}
                      >
                        {portalSubscriptionChargeStatusLabel[c.status]}
                      </Badge>
                      {c.failureReason && (
                        <div className="text-destructive mt-0.5 text-xs">
                          {c.failureReason}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-muted-foreground text-xs">
          As notas fiscais (NFS-e) das mensalidades pagas ficam em{" "}
          <strong>Financeiro</strong>.
        </p>
      </CardContent>
    </Card>
  );
}
