"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  RecordCard,
  RecordCardActions,
  RecordCardHeader,
  RecordField,
} from "@/components/shared/record-card";
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
  type PortalSubscriptionChargeDTO,
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

type SimulateFn = ReturnType<typeof useSimulatePortalCharge>;

function StatusBadge({ status }: { status: PortalSubscriptionChargeStatus }) {
  return (
    <Badge variant="secondary" className={badgeClass[status] ?? ""}>
      {portalSubscriptionChargeStatusLabel[status]}
    </Badge>
  );
}

function SimulateActions({
  charge,
  simulate,
}: {
  charge: PortalSubscriptionChargeDTO;
  simulate: SimulateFn;
}) {
  if (charge.status !== "PROCESSING" && charge.status !== "PENDING")
    return null;
  const run = (outcome: "approved" | "rejected", okMsg: string) =>
    simulate.mutate(
      { chargeId: charge.id, outcome },
      {
        onSuccess: () => toast.success(okMsg),
        onError: (e) =>
          toast.error(e instanceof ApiError ? e.message : "Falha."),
      }
    );
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={simulate.isPending}
        onClick={() => run("approved", "Mensalidade aprovada.")}
      >
        Aprovar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive"
        disabled={simulate.isPending}
        onClick={() =>
          run("rejected", "Mensalidade recusada — carência iniciada.")
        }
      >
        Recusar
      </Button>
    </>
  );
}

export default function AdminPortalSubscriptionChargesPage() {
  const [status, setStatus] = useState<PortalSubscriptionChargeStatus | "ALL">(
    "ALL"
  );
  const { data: charges, isLoading } = useAdminPortalCharges(status);
  const { data: mode } = useAdminPortalChargeMode();
  const simulate = useSimulatePortalCharge();
  const canSimulate = !!mode?.simulated;

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

      <div className="w-full space-y-1 sm:max-w-[220px]">
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

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : !charges || charges.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-6 text-center text-sm">
            Nenhuma mensalidade neste filtro.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: lista de cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {charges.map((c) => (
              <RecordCard key={c.id}>
                <RecordCardHeader
                  title={c.companyName}
                  aside={<StatusBadge status={c.status} />}
                />
                <RecordField label="Plataforma">
                  {c.subdomain} · {c.planName}
                </RecordField>
                <RecordField label="Vencimento">
                  <span className="tabular-nums">{dateOnly(c.dueDate)}</span>
                </RecordField>
                <RecordField label="Valor">
                  <span className="tabular-nums">{money(c.amount)}</span>
                </RecordField>
                {c.failureReason && (
                  <p className="text-destructive text-xs">{c.failureReason}</p>
                )}
                {canSimulate &&
                  (c.status === "PROCESSING" || c.status === "PENDING") && (
                    <RecordCardActions>
                      <SimulateActions charge={c} simulate={simulate} />
                    </RecordCardActions>
                  )}
              </RecordCard>
            ))}
          </div>

          {/* Desktop: tabela */}
          <Card className="hidden p-0 md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contratante</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    {canSimulate && (
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
                      <TableCell className="text-muted-foreground text-xs">
                        {c.subdomain} · {c.planName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {dateOnly(c.dueDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {money(c.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                        {c.failureReason && (
                          <div className="text-destructive mt-0.5 text-xs break-words">
                            {c.failureReason}
                          </div>
                        )}
                      </TableCell>
                      {canSimulate && (
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                            <SimulateActions charge={c} simulate={simulate} />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
