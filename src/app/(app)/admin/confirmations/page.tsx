"use client";

import { BadgeCheck, Eye, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useReviewConfirmation } from "@/hooks/mutations/useAdminConfirmationActions";
import {
  useAdminConfirmationQueue,
  useAdminConfirmationsList,
  useAdminPendingReconciliation,
} from "@/hooks/queries/useAdminConfirmations";
import { ApiError } from "@/lib/api-client";
import {
  matchConfirmationReasonLabels,
  matchConfirmationStatusLabels,
  type AdminMatchConfirmationDTO,
} from "@/types/admin";
import { commissionChargeStatusLabels } from "@/types/billing";
import type { MatchConfirmationStatus } from "@/types/match";

function chargeLabel(status: string) {
  return (
    commissionChargeStatusLabels[
      status as keyof typeof commissionChargeStatusLabels
    ] ?? status
  );
}

const STATUS_FILTERS: (MatchConfirmationStatus | "ALL")[] = [
  "ALL",
  "AWAITING_RESPONSES",
  "CONFIRMED",
  "PENDING_ADMIN_REVIEW",
  "CLOSED_NO_CHARGE",
  "CLOSED_UNRESOLVED",
];

const outcomeLabel: Record<string, string> = {
  WORKING_TOGETHER: "Trabalhando juntos",
  PROJECT_COMPLETED: "Concluído",
  DID_NOT_WORK_OUT: "Não deu certo",
  NO_CONTACT_YET: "Sem contato",
};

function money(value: number | null) {
  return value == null
    ? "—"
    : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusBadgeClass(status: MatchConfirmationStatus) {
  switch (status) {
    case "CONFIRMED":
      return "bg-success/15 text-success";
    case "PENDING_ADMIN_REVIEW":
      return "bg-destructive/15 text-destructive";
    case "CLOSED_NO_CHARGE":
    case "CLOSED_UNRESOLVED":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-warning/15 text-warning";
  }
}

export default function AdminConfirmationsPage() {
  const [statusFilter, setStatusFilter] = useState<
    MatchConfirmationStatus | "ALL"
  >("PENDING_ADMIN_REVIEW");

  const queue = useAdminConfirmationQueue();
  const list = useAdminConfirmationsList(statusFilter, null);
  const reconciliation = useAdminPendingReconciliation();
  const pendingCount = reconciliation.data?.length ?? 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Confirmações pós-contratação
        </h1>
        <p className="text-muted-foreground text-sm">
          Supervisão das janelas de confirmação de 30 dias e triagem manual dos
          casos.
        </p>
      </div>

      <Card
        className={
          pendingCount > 0 ? "border-destructive/40 bg-destructive/5" : undefined
        }
      >
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldAlert
                className={
                  pendingCount > 0 ? "text-destructive size-4" : "size-4"
                }
              />
              Reconciliação manual
              {pendingCount > 0 && (
                <Badge className="bg-destructive/15 text-destructive">
                  {pendingCount}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {pendingCount > 0
                ? "Contratações que a confirmação automática não resolveu — defina o valor final ou marque como não confirmável."
                : "Nenhuma contratação pendente de reconciliação no momento."}
            </p>
          </div>
          <Button
            asChild
            variant={pendingCount > 0 ? "default" : "outline"}
            size="sm"
          >
            <Link href="/admin/confirmations/reconciliation">
              Abrir fila de reconciliação
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">
            Fila de atenção{" "}
            {queue.data && queue.data.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queue.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Todas as confirmações</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Empresas que pedem avaliação manual
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                Suspeitas, sob observação, ou com casos em análise / ainda não
                revisados.
              </p>
            </CardHeader>
            <CardContent className="px-0">
              {queue.isLoading ? (
                <Skeleton className="mx-4 h-40" />
              ) : !queue.data || queue.data.length === 0 ? (
                <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                  Nenhuma empresa pedindo atenção agora.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead className="text-center">
                          Em análise
                        </TableHead>
                        <TableHead className="text-center">
                          Ninguém concluiu
                        </TableHead>
                        <TableHead className="text-center">
                          Divergência
                        </TableHead>
                        <TableHead className="text-center">
                          Sem resposta
                        </TableHead>
                        <TableHead className="text-center">
                          Não revisados
                        </TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queue.data.map((row) => (
                        <TableRow key={row.companyId}>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-1.5 font-medium">
                              {row.companyName}
                              {row.suspicious && (
                                <Badge className="bg-destructive/15 text-destructive">
                                  <ShieldAlert className="size-3" />
                                  Suspeita
                                </Badge>
                              )}
                              {row.underObservation && (
                                <Badge
                                  variant="outline"
                                  className="border-warning/40 text-warning"
                                >
                                  <Eye className="size-3" />
                                  Sob observação
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {row.pendingReviewCount}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {row.closedNoChargeCount}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {row.valueDivergenceCount}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {row.noResponseCount}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {row.unreviewedCount}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/company/${row.companyId}`}>
                                <Eye className="size-3.5" />
                                Histórico
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4 flex flex-col gap-3">
          <div className="max-w-xs space-y-1">
            <Label className="text-xs">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as MatchConfirmationStatus | "ALL")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "ALL" ? "Todos" : matchConfirmationStatusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="px-0">
              {list.isLoading ? (
                <Skeleton className="mx-4 h-40" />
              ) : !list.data || list.data.length === 0 ? (
                <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                  Nenhuma confirmação neste filtro.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contratação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contratante disse</TableHead>
                        <TableHead>Profissional disse</TableHead>
                        <TableHead>Valor final</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.data.map((c) => (
                        <ConfirmationRow key={c.matchId} confirmation={c} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConfirmationRow({
  confirmation: c,
}: {
  confirmation: AdminMatchConfirmationDTO;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const review = useReviewConfirmation();

  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/admin/company/${c.companyId}`}
          className="font-medium hover:underline"
        >
          {c.companyName}
        </Link>
        <div className="text-muted-foreground text-xs">
          {c.professionalName} · {c.projectTitle}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className={statusBadgeClass(c.status)}>
            {matchConfirmationStatusLabels[c.status]}
          </Badge>
          {c.pendingReason && (
            <span className="text-muted-foreground text-xs">
              {matchConfirmationReasonLabels[c.pendingReason]}
            </span>
          )}
          {c.adminReviewed && (
            <span className="text-success flex items-center gap-1 text-xs">
              <BadgeCheck className="size-3" />
              Revisado
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-sm">
        {c.companyOutcome ? (
          <>
            {outcomeLabel[c.companyOutcome] ?? c.companyOutcome}
            {c.companyAmount != null && (
              <div className="text-muted-foreground text-xs tabular-nums">
                {money(c.companyAmount)}
              </div>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-sm">
        {c.professionalOutcome ? (
          <>
            {outcomeLabel[c.professionalOutcome] ?? c.professionalOutcome}
            {c.professionalAmount != null && (
              <div className="text-muted-foreground text-xs tabular-nums">
                {money(c.professionalAmount)}
              </div>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-sm tabular-nums">
        {c.confirmedAmount != null ? (
          <span className="text-success font-semibold">
            {money(c.confirmedAmount)}
            {c.resolution === "ADMIN_SET_VALUE" && (
              <span className="text-muted-foreground ml-1 text-xs">
                (suporte)
              </span>
            )}
          </span>
        ) : c.status === "CLOSED_NO_CHARGE" ||
          c.status === "CLOSED_UNRESOLVED" ? (
          <span className="text-muted-foreground">sem valor</span>
        ) : (
          <span className="text-muted-foreground">
            sug. {money(c.suggestedAmount)}
          </span>
        )}
        {c.chargeStatus && (
          <div className="text-muted-foreground mt-0.5 text-xs">
            Comissão: {chargeLabel(c.chargeStatus)}
            {c.chargeAmount != null && ` · ${money(c.chargeAmount)}`}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setNote(c.adminNote ?? "");
            setOpen(true);
          }}
        >
          {c.adminReviewed ? "Editar nota" : "Marcar revisado"}
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marcar como revisado</DialogTitle>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor={`note-${c.matchId}`}>Nota (opcional)</Label>
              <Textarea
                id={`note-${c.matchId}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="O que você verificou / decidiu neste caso"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                disabled={review.isPending}
                onClick={() =>
                  review.mutate(
                    { matchId: c.matchId, note: note.trim() || null },
                    {
                      onSuccess: () => {
                        toast.success("Caso marcado como revisado.");
                        setOpen(false);
                      },
                      onError: (error) =>
                        toast.error(
                          error instanceof ApiError
                            ? error.message
                            : "Não foi possível salvar."
                        ),
                    }
                  )
                }
              >
                {review.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
