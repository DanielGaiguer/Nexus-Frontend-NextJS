"use client";

import { ArrowLeft, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useMarkUnconfirmable,
  useResolveConfirmation,
} from "@/hooks/mutations/useAdminConfirmationActions";
import { useAdminPendingReconciliation } from "@/hooks/queries/useAdminConfirmations";
import { ApiError } from "@/lib/api-client";
import {
  matchConfirmationReasonLabels,
  type AdminMatchConfirmationDTO,
} from "@/types/admin";

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

/** Sugestão para o campo de valor: média dos dois quando ambos deram valor;
 * senão o valor do único que respondeu; senão o valor sugerido. */
function suggestFinal(c: AdminMatchConfirmationDTO): number | null {
  const a = c.companyAmount;
  const b = c.professionalAmount;
  if (a != null && b != null) return Math.round(((a + b) / 2) * 100) / 100;
  if (a != null) return a;
  if (b != null) return b;
  return c.suggestedAmount;
}

export default function ReconciliationPage() {
  const { data, isLoading } = useAdminPendingReconciliation();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <Link
          href="/admin/confirmations"
          className="text-muted-foreground hover:text-foreground mb-2 flex w-fit items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Confirmações
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Reconciliação manual
        </h1>
        <p className="text-muted-foreground text-sm">
          Contratações que a confirmação automática não resolveu (valores
          divergentes, um lado sem responder, ou desacordo sobre a conclusão).
          Após contato com as partes, defina o valor final ou marque que não foi
          possível confirmar.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
      ) : !data || data.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            Nenhuma contratação pendente de reconciliação. 🎉
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((c) => (
            <ReconciliationCard key={c.matchId} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReconciliationCard({ c }: { c: AdminMatchConfirmationDTO }) {
  return (
    <Card>
      <CardHeader className="gap-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="min-w-0 text-sm break-words">
            <Link
              href={`/admin/company/${c.companyId}`}
              className="hover:underline"
            >
              {c.companyName}
            </Link>
            <span className="text-muted-foreground font-normal">
              {" "}
              · {c.professionalName} · {c.projectTitle}
            </span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            {c.pendingReason && (
              <Badge className="bg-destructive/15 text-destructive">
                <ShieldAlert className="size-3" />
                {matchConfirmationReasonLabels[c.pendingReason]}
              </Badge>
            )}
            <Badge variant="outline" className="text-muted-foreground">
              <Clock className="size-3" />
              {c.daysPending} {c.daysPending === 1 ? "dia" : "dias"} pendente
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <SideBox
            title="Contratante"
            answered={c.companyAnswered}
            outcome={c.companyOutcome}
            amount={c.companyAmount}
            isJob={c.opportunityType === "JOB"}
          />
          <SideBox
            title="Profissional"
            answered={c.professionalAnswered}
            outcome={c.professionalOutcome}
            amount={c.professionalAmount}
            isJob={c.opportunityType === "JOB"}
          />
        </div>

        {c.suggestedAmount != null && (
          <p className="text-muted-foreground text-xs">
            Valor sugerido no envio (proposta / faixa do projeto):{" "}
            {money(c.suggestedAmount)}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <MarkUnconfirmableDialog c={c} />
          <ResolveDialog c={c} />
        </div>
      </CardContent>
    </Card>
  );
}

function SideBox({
  title,
  answered,
  outcome,
  amount,
  isJob,
}: {
  title: string;
  answered: boolean;
  outcome: string | null;
  amount: number | null;
  isJob: boolean;
}) {
  return (
    <div className="bg-muted/40 rounded-lg border p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
        {!answered && (
          <Badge
            variant="outline"
            className="border-warning/40 text-warning text-[11px]"
          >
            não respondeu
          </Badge>
        )}
      </div>
      {answered ? (
        <div className="text-sm">
          <div>{outcome ? (outcomeLabel[outcome] ?? outcome) : "—"}</div>
          <div className="text-muted-foreground text-xs">
            {isJob ? "Salário 1º mês: " : "Valor do projeto: "}
            <span className="tabular-nums">{money(amount)}</span>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">Sem resposta registrada.</p>
      )}
    </div>
  );
}

function ResolveDialog({ c }: { c: AdminMatchConfirmationDTO }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const resolve = useResolveConfirmation();

  const parsed = Number(amount.trim().replace(",", "."));
  const valid = !Number.isNaN(parsed) && parsed > 0;

  function openDialog() {
    const s = suggestFinal(c);
    setAmount(s != null ? String(s) : "");
    setNote("");
    setOpen(true);
  }

  return (
    <>
      <Button size="sm" className="w-full sm:w-auto" onClick={openDialog}>
        Definir valor final
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir o valor final</DialogTitle>
            <DialogDescription>
              Este valor vira definitivo para fins de comissão, exatamente como
              uma confirmação em que os dois lados concordaram.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`amt-${c.matchId}`}>Valor final (R$)</Label>
              <Input
                id={`amt-${c.matchId}`}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-invalid={amount.trim() !== "" && !valid}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`rnote-${c.matchId}`}>Nota (opcional)</Label>
              <Textarea
                id={`rnote-${c.matchId}`}
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Como chegou a este valor (ex.: contato com as duas partes em DD/MM)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!valid || resolve.isPending}
              onClick={() =>
                resolve.mutate(
                  {
                    matchId: c.matchId,
                    finalAmount: parsed,
                    note: note.trim() || null,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Valor final registrado.");
                      setOpen(false);
                    },
                    onError: (error) =>
                      toast.error(
                        error instanceof ApiError
                          ? error.message
                          : "Não foi possível registrar."
                      ),
                  }
                )
              }
            >
              {resolve.isPending ? "Salvando…" : "Confirmar valor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MarkUnconfirmableDialog({ c }: { c: AdminMatchConfirmationDTO }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const mark = useMarkUnconfirmable();

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        Não foi possível confirmar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como não confirmável</DialogTitle>
            <DialogDescription>
              A contratação fica encerrada <strong>sem valor</strong> e{" "}
              <strong>sem comissão</strong>. Nenhum valor é inventado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor={`unote-${c.matchId}`}>Nota (opcional)</Label>
            <Textarea
              id={`unote-${c.matchId}`}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex.: nenhum dos dois respondeu mesmo após 2 contatos"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90"
              disabled={mark.isPending}
              onClick={() =>
                mark.mutate(
                  { matchId: c.matchId, note: note.trim() || null },
                  {
                    onSuccess: () => {
                      toast.success("Marcada como não confirmável.");
                      setOpen(false);
                    },
                    onError: (error) =>
                      toast.error(
                        error instanceof ApiError
                          ? error.message
                          : "Não foi possível registrar."
                      ),
                  }
                )
              }
            >
              {mark.isPending ? "Salvando…" : "Encerrar sem valor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
