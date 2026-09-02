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
import { useSimulatePortalCharge } from "@/hooks/mutations/usePortalSubscriptionActions";
import {
  useAdminPortalChargeMode,
  useAdminPortalCharges,
} from "@/hooks/queries/usePortalSubscription";
import { ApiError } from "@/lib/api-client";
import {
  portalSubscriptionChargeStatusLabel,
  type PortalSubscriptionChargeStatus,
} from "@/types/custom-portal";

const FILTERS: (PortalSubscriptionChargeStatus | "ALL")[] = [
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

function dateOnly(iso: string) {
  const [y, m, d] = iso.split("-");
  return d ? `${d}/${m}/${y}` : iso;
}

const badgeClass: Record<string, string> = {
  PAID: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  PROCESSING: "bg-warning/15 text-warning",
  PENDING: "bg-warning/15 text-warning",
  CANCELED: "bg-muted text-muted-foreground",
};

export default function AdminPortalSubscriptionChargesPage() {
  const [status, setStatus] = useState<PortalSubscriptionChargeStatus | "ALL">(
    "ALL"
  );
  const { data: charges, isLoading } = useAdminPortalCharges(status);
  const { data: mode } = useAdminPortalChargeMode();
  const simulate = useSimulatePortalCharge();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Mensalidades de plataforma
        </h1>
        <p className="text-muted-foreground text-sm">
          Cobranças recorrentes da assinatura das plataformas personalizadas.
        </p>
      </div>

      {mode && !mode.live && !mode.simulated && (
        <Card>
          <CardContent className="text-muted-foreground text-sm">
            A cobrança está desligada nesta instância — nenhuma mensalidade é
            gerada.
          </CardContent>
        </Card>
      )}
      {mode?.simulated && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="text-sm">
            <span className="text-warning font-semibold">Modo de teste.</span>{" "}
            Sem Mercado Pago: aprove ou recuse cada mensalidade para ver a
            plataforma seguir no ar, entrar em carência ou ser suspensa.
          </CardContent>
        </Card>
      )}

      <div className="max-w-[200px] space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={status}
          onValueChange={(v) =>
            setStatus(v as PortalSubscriptionChargeStatus | "ALL")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f} value={f}>
                {f === "ALL" ? "Todas" : portalSubscriptionChargeStatusLabel[f]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          {isLoading ? (
            <Skeleton className="m-4 h-40" />
          ) : !charges || charges.length === 0 ? (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
              Nenhuma mensalidade neste filtro.
            </p>
          ) : (
            <Table className="table-fixed text-xs [&_td]:px-2.5 [&_td]:py-2 [&_td]:align-top [&_th]:h-9 [&_th]:px-2.5">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[24%]">Contratante</TableHead>
                  <TableHead className="w-[22%]">Plataforma</TableHead>
                  <TableHead className="w-[13%]">Vencimento</TableHead>
                  <TableHead className="w-[13%]">Valor</TableHead>
                  <TableHead className="w-[16%]">Status</TableHead>
                  {mode?.simulated && (
                    <TableHead className="w-[12%] text-right">
                      Simular
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium break-words whitespace-normal">
                      {c.companyName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] break-words whitespace-normal">
                      {c.subdomain} · {c.planName}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {dateOnly(c.dueDate)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {money(c.amount)}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <Badge
                        variant="secondary"
                        className={badgeClass[c.status] ?? ""}
                      >
                        {portalSubscriptionChargeStatusLabel[c.status]}
                      </Badge>
                      {c.failureReason && (
                        <div className="text-destructive mt-0.5 text-[11px]">
                          {c.failureReason}
                        </div>
                      )}
                    </TableCell>
                    {mode?.simulated && (
                      <TableCell className="text-right">
                        {(c.status === "PROCESSING" ||
                          c.status === "PENDING") && (
                          <div className="flex flex-wrap justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px]"
                              disabled={simulate.isPending}
                              onClick={() =>
                                simulate.mutate(
                                  { chargeId: c.id, outcome: "approved" },
                                  {
                                    onSuccess: () =>
                                      toast.success("Mensalidade aprovada."),
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
                              className="text-destructive h-7 px-2 text-[11px]"
                              disabled={simulate.isPending}
                              onClick={() =>
                                simulate.mutate(
                                  { chargeId: c.id, outcome: "rejected" },
                                  {
                                    onSuccess: () =>
                                      toast.success(
                                        "Mensalidade recusada — carência iniciada."
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
