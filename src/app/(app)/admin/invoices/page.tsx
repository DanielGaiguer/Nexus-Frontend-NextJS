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
import {
  useRetryInvoice,
  useSimulateInvoice,
} from "@/hooks/mutations/useNfseActions";
import { useAdminInvoices, useAdminNfseMode } from "@/hooks/queries/useNfse";
import { ApiError } from "@/lib/api-client";
import { nfseInvoiceStatusLabels, type NfseInvoiceStatus } from "@/types/nfse";

const FILTERS: (NfseInvoiceStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "ISSUED",
  "FAILED",
  "CANCELED",
];

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const badgeClass: Record<string, string> = {
  ISSUED: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  PROCESSING: "bg-warning/15 text-warning",
  PENDING: "bg-warning/15 text-warning",
  CANCELED: "bg-muted text-muted-foreground",
};

export default function AdminInvoicesPage() {
  const [status, setStatus] = useState<NfseInvoiceStatus | "ALL">("ALL");
  const { data: invoices, isLoading } = useAdminInvoices(status);
  const { data: mode } = useAdminNfseMode();
  const retry = useRetryInvoice();
  const simulate = useSimulateInvoice();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notas fiscais</h1>
        <p className="text-muted-foreground text-sm">
          NFS-e emitidas para cada comissão paga. As que falharam ficam aqui
          para você resolver, sem travar o restante do fluxo.
        </p>
      </div>

      {mode && !mode.live && !mode.simulated && (
        <Card>
          <CardContent className="text-muted-foreground text-sm">
            A emissão de NFS-e está desligada nesta instância — nenhuma nota é
            gerada. Configure o eNotas em <strong>Configuração fiscal</strong>.
          </CardContent>
        </Card>
      )}
      {mode?.simulated && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="text-sm">
            <span className="text-warning font-semibold">Modo de teste.</span>{" "}
            Sem eNotas: use os botões abaixo para simular o resultado de cada
            emissão.
          </CardContent>
        </Card>
      )}

      <div className="max-w-[200px] space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as NfseInvoiceStatus | "ALL")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f} value={f}>
                {f === "ALL" ? "Todas" : nfseInvoiceStatusLabels[f]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="px-0 py-0">
        <CardContent className="px-0">
          {isLoading ? (
            <Skeleton className="m-4 h-40" />
          ) : !invoices || invoices.length === 0 ? (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
              Nenhuma nota neste filtro.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contratante</TableHead>
                    <TableHead>Contratação</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">
                        {n.companyName}
                      </TableCell>
                      <TableCell>
                        <div>{n.projectTitle}</div>
                        <div className="text-muted-foreground text-xs">
                          {n.professionalName}
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {money(n.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={badgeClass[n.status] ?? ""}
                        >
                          {nfseInvoiceStatusLabels[n.status]}
                        </Badge>
                        {n.failureReason && (
                          <div className="text-destructive mt-0.5 text-xs">
                            {n.failureReason}
                          </div>
                        )}
                        {n.attempts > 0 && (
                          <div className="text-muted-foreground mt-0.5 text-xs">
                            {n.attempts} tentativa{n.attempts > 1 ? "s" : ""}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {n.linkPdf ? (
                          <a
                            href={n.linkPdf}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            PDF{n.numero ? ` · nº ${n.numero}` : ""}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {mode?.simulated &&
                            (n.status === "PROCESSING" ||
                              n.status === "PENDING") && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={simulate.isPending}
                                  onClick={() =>
                                    simulate.mutate(
                                      { id: n.id, outcome: "authorized" },
                                      {
                                        onSuccess: () =>
                                          toast.success("Nota autorizada."),
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
                                  Autorizar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  disabled={simulate.isPending}
                                  onClick={() =>
                                    simulate.mutate(
                                      { id: n.id, outcome: "denied" },
                                      {
                                        onSuccess: () =>
                                          toast.success("Nota negada."),
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
                                  Negar
                                </Button>
                              </>
                            )}
                          {(n.status === "FAILED" ||
                            n.status === "PENDING") && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={retry.isPending}
                              onClick={() =>
                                retry.mutate(n.id, {
                                  onSuccess: () =>
                                    toast.success("Emissão reenviada."),
                                  onError: (e) =>
                                    toast.error(
                                      e instanceof ApiError
                                        ? e.message
                                        : "Falha ao reenviar."
                                    ),
                                })
                              }
                            >
                              Tentar novamente
                            </Button>
                          )}
                        </div>
                      </TableCell>
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
