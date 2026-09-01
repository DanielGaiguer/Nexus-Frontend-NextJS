"use client";

import { BadgeCheck, Eye, ShieldAlert } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useReviewConfirmation,
  useSetCompanyObservation,
} from "@/hooks/mutations/useAdminConfirmationActions";
import { useAdminCompanyConfirmations } from "@/hooks/queries/useAdminConfirmations";
import { ApiError } from "@/lib/api-client";
import {
  matchConfirmationReasonLabels,
  matchConfirmationStatusLabels,
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

export function CompanyConfirmationsCard({ companyId }: { companyId: number }) {
  const { data, isLoading } = useAdminCompanyConfirmations(companyId);
  const setObservation = useSetCompanyObservation();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BadgeCheck className="text-primary size-4" />
              Confirmações pós-contratação
              {data && (
                <Badge variant="secondary">{data.totalConfirmations}</Badge>
              )}
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Janelas de 30 dias — resultado que cada lado informou.
            </p>
          </div>
          {data?.suspicious && (
            <Badge className="bg-destructive/15 text-destructive">
              <ShieldAlert className="size-3" />
              Padrão suspeito
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading || !data ? (
          <Skeleton className="h-32" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Metric label="Confirmadas" value={data.confirmedCount} />
              <Metric label="Em análise" value={data.pendingReviewCount} />
              <Metric
                label="Ninguém concluiu"
                value={data.closedNoChargeCount}
              />
              <Metric
                label="Divergência de valor"
                value={data.valueDivergenceCount}
              />
              <Metric label="Sem resposta" value={data.noResponseCount} />
              <Metric
                label="Sem confirmação"
                value={data.closedUnresolvedCount}
              />
              <Metric label="Aguardando" value={data.awaitingCount} />
            </div>

            <label className="flex items-center gap-3 rounded-md border p-3">
              <Switch
                checked={data.underObservation}
                disabled={setObservation.isPending}
                onCheckedChange={(checked) =>
                  setObservation.mutate(
                    { companyId, underObservation: checked },
                    {
                      onError: (error) =>
                        toast.error(
                          error instanceof ApiError
                            ? error.message
                            : "Não foi possível atualizar."
                        ),
                    }
                  )
                }
              />
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Eye className="size-4" />
                Empresa sob observação
              </span>
              <span className="text-muted-foreground text-xs">
                Sinalizador manual — não bloqueia nem suspende automaticamente.
              </span>
            </label>

            {data.confirmations.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhuma confirmação registrada ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.confirmations.map((c) => (
                  <ConfirmationItem key={c.matchId} c={c} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted/40 rounded-lg border p-2.5">
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="text-muted-foreground text-[11px]">{label}</div>
    </div>
  );
}

function ConfirmationItem({ c }: { c: AdminMatchConfirmationDTO }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const review = useReviewConfirmation();

  return (
    <div className="bg-muted/40 rounded-lg border p-3 text-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">
          {c.professionalName} · {c.projectTitle}
        </span>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary">
            {matchConfirmationStatusLabels[c.status]}
          </Badge>
          {c.adminReviewed && (
            <span className="text-success flex items-center gap-1 text-xs">
              <BadgeCheck className="size-3" />
              Revisado
            </span>
          )}
        </div>
      </div>
      {c.pendingReason && (
        <div className="text-muted-foreground mb-1 text-xs">
          Motivo: {matchConfirmationReasonLabels[c.pendingReason]}
        </div>
      )}
      <div className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
        <span>
          Contratante:{" "}
          {c.companyOutcome
            ? `${outcomeLabel[c.companyOutcome] ?? c.companyOutcome}${
                c.companyAmount != null ? ` · ${money(c.companyAmount)}` : ""
              }`
            : "não respondeu"}
        </span>
        <span>
          Profissional:{" "}
          {c.professionalOutcome
            ? `${outcomeLabel[c.professionalOutcome] ?? c.professionalOutcome}${
                c.professionalAmount != null
                  ? ` · ${money(c.professionalAmount)}`
                  : ""
              }`
            : "não respondeu"}
        </span>
        {c.confirmedAmount != null && (
          <span className="text-success col-span-2 font-semibold">
            Valor final: {money(c.confirmedAmount)}
          </span>
        )}
      </div>
      {c.adminNote && (
        <p className="text-muted-foreground mt-1 text-xs italic">
          Nota: {c.adminNote}
        </p>
      )}
      <div className="mt-2 flex justify-end">
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
      </div>
    </div>
  );
}
