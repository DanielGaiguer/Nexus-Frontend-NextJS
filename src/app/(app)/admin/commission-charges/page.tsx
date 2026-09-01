"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSimulateCharge } from "@/hooks/mutations/useAdminChargeActions";
import {
  useAdminBillingMode,
  useAdminCommissionCharges,
} from "@/hooks/queries/useBilling";
import { ApiError } from "@/lib/api-client";
import {
  commissionChargeStatusLabels,
  type CommissionChargeStatus,
} from "@/types/billing";

const FILTERS: (CommissionChargeStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "CANCELED",
];

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const badgeClass: Record<string, string> = {
  PAID: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  PROCESSING: "bg-warning/15 text-warning",
  PENDING: "bg-warning/15 text-warning",
  CANCELED: "bg-muted text-muted-foreground",
};

export default function AdminCommissionChargesPage() {
  const [status, setStatus] = useState<CommissionChargeStatus | "ALL">("ALL");
  const { data: charges, isLoading } = useAdminCommissionCharges(status);
  const { data: mode } = useAdminBillingMode();
  const simulate = useSimulateCharge();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Cobranças de comissão
        </h1>
        <p className="text-muted-foreground text-sm">
          Cobranças geradas quando uma contratação confirmada sai das 3
          gratuitas.
        </p>
      </div>

      {mode && !mode.live && !mode.simulated && (
        <Card>
          <CardContent className="text-muted-foreground text-sm">
            A cobrança está desligada nesta instância — nenhuma cobrança é
            gerada.
          </CardContent>
        </Card>
      )}
      {mode?.simulated && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="text-sm">
            <span className="text-warning font-semibold">Modo de teste.</span>{" "}
            Sem Mercado Pago: use os botões abaixo para simular o resultado de
            cada cobrança e ver o bloqueio/desbloqueio do contratante.
          </CardContent>
        </Card>
      )}

      <div className="max-w-[200px] space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={status}
          onValueChange={(v) =>
            setStatus(v as CommissionChargeStatus | "ALL")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f} value={f}>
                {f === "ALL" ? "Todas" : commissionChargeStatusLabels[f]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="px-0 py-0">
        <CardContent className="px-0">
          {isLoading ? (
            <Skeleton className="m-4 h-40" />
          ) : !charges || charges.length === 0 ? (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
              Nenhuma cobrança neste filtro.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contratante</TableHead>
                    <TableHead>Contratação</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>MP</TableHead>
                    {mode?.simulated && (
                      <TableHead className="text-right">Simular</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charges.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.companyName}
                      </TableCell>
                      <TableCell>
                        <div>{c.projectTitle}</div>
                        <div className="text-muted-foreground text-xs">
                          {c.professionalName}
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {money(c.amount)}
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({c.percentage}% de {money(c.baseAmount)})
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={badgeClass[c.status] ?? ""}
                        >
                          {commissionChargeStatusLabels[c.status]}
                        </Badge>
                        {c.failureReason && (
                          <div className="text-destructive mt-0.5 text-xs">
                            {c.failureReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {c.mpPaymentId ?? "—"}
                        {c.attempts > 0 && ` · ${c.attempts}x`}
                      </TableCell>
                      {mode?.simulated && (
                        <TableCell className="text-right">
                          {(c.status === "PROCESSING" ||
                            c.status === "PENDING") && (
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={simulate.isPending}
                                onClick={() =>
                                  simulate.mutate(
                                    { chargeId: c.id, outcome: "approved" },
                                    {
                                      onSuccess: () =>
                                        toast.success("Cobrança aprovada."),
                                      onError: (e) =>
                                        toast.error(
                                          e instanceof ApiError
                                            ? e.message
                                            : "Falha."
                                        ),
                                    }
                                  )
                                }
                              >
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                disabled={simulate.isPending}
                                onClick={() =>
                                  simulate.mutate(
                                    { chargeId: c.id, outcome: "rejected" },
                                    {
                                      onSuccess: () =>
                                        toast.success(
                                          "Cobrança recusada — contratante bloqueado."
                                        ),
                                      onError: (e) =>
                                        toast.error(
                                          e instanceof ApiError
                                            ? e.message
                                            : "Falha."
                                        ),
                                    }
                                  )
                                }
                              >
                                Recusar
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
