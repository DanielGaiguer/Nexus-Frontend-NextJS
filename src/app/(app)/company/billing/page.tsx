"use client";

import {
  AlertTriangle,
  Clock,
  CreditCard,
  FileText,
  Gift,
  RefreshCw,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CardForm } from "@/components/company/card-form";
import { FiscalProfileCard } from "@/components/company/fiscal-profile-card";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  useRemoveCard,
  useRetryCharge,
  useSaveCard,
} from "@/hooks/mutations/useBillingActions";
import {
  useBillingCharges,
  useBillingConfig,
  useBillingStatus,
} from "@/hooks/queries/useBilling";
import { useContractorFinanceOverview } from "@/hooks/queries/useFinance";
import { useCompanyInvoices } from "@/hooks/queries/useNfse";
import { ApiError } from "@/lib/api-client";
import { commissionChargeStatusLabels } from "@/types/billing";
import { nfseInvoiceStatusLabels } from "@/types/nfse";

function money(value: number | null) {
  return value == null
    ? "—"
    : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function date(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

const chargeBadgeClass: Record<string, string> = {
  PAID: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  PROCESSING: "bg-warning/15 text-warning",
  PENDING: "bg-warning/15 text-warning",
  CANCELED: "bg-muted text-muted-foreground",
};

const invoiceBadgeClass: Record<string, string> = {
  ISSUED: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  PROCESSING: "bg-warning/15 text-warning",
  PENDING: "bg-warning/15 text-warning",
  CANCELED: "bg-muted text-muted-foreground",
};

export default function CompanyBillingPage() {
  const { data: config } = useBillingConfig();
  const enabled = config?.enabled ?? false;
  const simulated = config?.simulated ?? false;
  const { data: status, isLoading } = useBillingStatus(enabled);
  const { data: charges } = useBillingCharges();
  const { data: invoices } = useCompanyInvoices(enabled);
  const { data: overview } = useContractorFinanceOverview(enabled);
  // Só as NFS-e de comissão têm matchId; as de mensalidade de plataforma ficam de fora.
  const invoiceByMatch = new Map(
    (invoices ?? []).filter((n) => n.matchId != null).map((n) => [n.matchId, n])
  );
  const removeCard = useRemoveCard();
  const retryCharge = useRetryCharge();
  const saveCard = useSaveCard();
  const [replacing, setReplacing] = useState(false);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Painel financeiro
          </h1>
          {simulated && (
            <Badge variant="outline" className="border-warning/40 text-warning">
              Modo de teste
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Extrato das comissões sobre contratações fechadas com sucesso (a
          partir da 4ª), notas fiscais e cartão de cobrança.
        </p>
      </div>

      {config && !enabled && (
        <Card>
          <CardContent className="text-muted-foreground text-sm">
            A cobrança de comissão não está habilitada nesta instância. Nada é
            cobrado e o cadastro de cartão fica indisponível.
          </CardContent>
        </Card>
      )}

      {enabled && overview && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Wallet}
            label="Comissão paga"
            value={money(overview.totalPaid)}
            accent="success"
          />
          <StatCard
            icon={TrendingUp}
            label="A cobrar"
            value={money(overview.totalPending)}
            accent={overview.totalPending > 0 ? "warning" : "primary"}
          />
          <StatCard
            icon={Clock}
            label="Aguardando confirmação"
            value={money(overview.awaitingConfirmationEstimated)}
            accent="primary"
          />
          <StatCard
            icon={Gift}
            label="Contratações grátis restantes"
            value={String(overview.freeHiresRemaining)}
            accent={overview.freeHiresRemaining > 0 ? "success" : "primary"}
          />
        </div>
      )}

      {enabled && overview?.portalHasSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Mensalidades da plataforma personalizada
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Cobrança recorrente da sua plataforma — separada da comissão.
              Detalhes e cartão em Minha Plataforma.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Pago</div>
              <div className="text-success text-lg font-bold tabular-nums">
                {money(overview.portalTotalPaid)}
              </div>
              <div className="text-muted-foreground text-xs">
                {overview.portalPaidCount} mensalidade(s)
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">A cobrar</div>
              <div className="text-lg font-bold tabular-nums">
                {money(overview.portalTotalPending)}
              </div>
              <div className="text-muted-foreground text-xs">
                {overview.portalPendingCount} em aberto
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {enabled && status?.blocked && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
              <div>
                <div className="text-destructive text-sm font-semibold">
                  Fechamento de novas contratações bloqueado
                </div>
                <p className="text-muted-foreground text-sm">
                  {status.blockMessage} Atualize o cartão abaixo e tente a
                  cobrança novamente.
                  {status.pendingChargeAmount != null && (
                    <>
                      {" "}
                      Comissão pendente: {money(status.pendingChargeAmount)}.
                    </>
                  )}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="self-start"
              disabled={!status.hasCard || retryCharge.isPending}
              onClick={() =>
                retryCharge.mutate(undefined, {
                  onSuccess: (s) =>
                    toast[s.blocked ? "error" : "success"](
                      s.blocked
                        ? "A cobrança ainda não passou."
                        : "Cobrança regularizada."
                    ),
                  onError: (e) =>
                    toast.error(
                      e instanceof ApiError ? e.message : "Falha ao tentar."
                    ),
                })
              }
            >
              <RefreshCw className="size-4" />
              Tentar cobrança novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CreditCard className="text-primary size-4" />
              Cartão de cobrança
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24" />
            ) : status?.hasCard && !replacing ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">
                    {status.cardBrand ?? "Cartão"} ···· {status.cardLast4}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {status.cardholderName ?? ""}
                    {status.cardExpMonth && status.cardExpYear
                      ? ` · ${String(status.cardExpMonth).padStart(2, "0")}/${status.cardExpYear}`
                      : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReplacing(true)}
                  >
                    Trocar cartão
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="size-4" />
                        Remover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover o cartão?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se houver comissão pendente, você ficará bloqueado de
                          fechar novas contratações até cadastrar outro cartão.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          disabled={removeCard.isPending}
                          onClick={() =>
                            removeCard.mutate(undefined, {
                              onSuccess: () =>
                                toast.success("Cartão removido."),
                              onError: (e) =>
                                toast.error(
                                  e instanceof ApiError
                                    ? e.message
                                    : "Falha ao remover."
                                ),
                            })
                          }
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {replacing && (
                  <button
                    type="button"
                    className="text-muted-foreground self-start text-xs hover:underline"
                    onClick={() => setReplacing(false)}
                  >
                    ← manter cartão atual
                  </button>
                )}
                {simulated ? (
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-muted-foreground text-sm">
                      Modo de teste: nenhum dado de cartão real é usado. O Nexus
                      registra um cartão fictício para você exercitar a
                      cobrança.
                    </p>
                    <Button
                      disabled={saveCard.isPending}
                      onClick={() =>
                        saveCard.mutate("SIMULATED", {
                          onSuccess: () => {
                            toast.success("Cartão de teste cadastrado.");
                            setReplacing(false);
                          },
                          onError: (e) =>
                            toast.error(
                              e instanceof ApiError
                                ? e.message
                                : "Falha ao cadastrar."
                            ),
                        })
                      }
                    >
                      Cadastrar cartão de teste
                    </Button>
                  </div>
                ) : (
                  <CardForm
                    publicKey={config?.publicKey ?? ""}
                    onSaved={() => setReplacing(false)}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {enabled && overview && overview.awaitingConfirmations.length > 0 && (
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="text-primary size-4" />
              Aguardando confirmação de 30 dias
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Contratações fechadas cuja janela de confirmação ainda está aberta
              — só geram cobrança depois que as duas partes confirmam o valor
              final.
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contratação</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Comissão estimada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.awaitingConfirmations.map((a) => (
                    <TableRow key={a.matchId}>
                      <TableCell>
                        <div className="font-medium">{a.projectTitle}</div>
                        <div className="text-muted-foreground text-xs">
                          {a.professionalName}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        até {date(a.deadline)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {a.estimatedCommission != null ? (
                          <>
                            ~ {money(a.estimatedCommission)}
                            <span className="text-muted-foreground ml-1 text-xs">
                              (sobre {money(a.suggestedAmount)})
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-sm">Extrato de comissões</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {!charges || charges.length === 0 ? (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
              Nenhuma comissão cobrada ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contratação</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nota fiscal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charges.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium">{c.projectTitle}</div>
                        <div className="text-muted-foreground text-xs">
                          {c.professionalName} ·{" "}
                          {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                        {c.failureReason && (
                          <div className="text-destructive text-xs">
                            {c.failureReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {money(c.baseAmount)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {money(c.amount)}
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({c.percentage}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={chargeBadgeClass[c.status] ?? ""}
                        >
                          {commissionChargeStatusLabels[c.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {(() => {
                          const n = invoiceByMatch.get(c.matchId);
                          if (!n)
                            return (
                              <span className="text-muted-foreground">—</span>
                            );
                          if (n.linkPdf) {
                            return (
                              <a
                                href={n.linkPdf}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                Baixar PDF
                                {n.numero ? ` · nº ${n.numero}` : ""}
                              </a>
                            );
                          }
                          return (
                            <span className="text-muted-foreground">
                              {nfseInvoiceStatusLabels[n.status]}
                              {n.status === "FAILED" && n.failureReason
                                ? ` — ${n.failureReason}`
                                : ""}
                            </span>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {enabled && invoices && invoices.length > 0 && (
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="text-primary size-4" />
              Notas fiscais
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contratação</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>
                        <div className="font-medium">{n.projectTitle}</div>
                        <div className="text-muted-foreground text-xs">
                          {n.professionalName ? `${n.professionalName} · ` : ""}
                          {date(n.createdAt)}
                        </div>
                        {n.status === "FAILED" && n.failureReason && (
                          <div className="text-destructive text-xs">
                            {n.failureReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {money(n.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={invoiceBadgeClass[n.status] ?? ""}
                        >
                          {nfseInvoiceStatusLabels[n.status]}
                        </Badge>
                        {n.numero && (
                          <div className="text-muted-foreground mt-0.5 text-xs">
                            nº {n.numero}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {n.linkPdf || n.linkXml ? (
                          <div className="flex gap-2">
                            {n.linkPdf && (
                              <a
                                href={n.linkPdf}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                PDF
                              </a>
                            )}
                            {n.linkXml && (
                              <a
                                href={n.linkXml}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                XML
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <FiscalProfileCard enabled={enabled} />
    </div>
  );
}
