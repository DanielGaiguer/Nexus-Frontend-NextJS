"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyRejectMatch } from "@/hooks/mutations/useCompanyMatchActions";
import { ApiError } from "@/lib/api-client";
import {
  companyRejectionReasonOptions,
  type CompanyRejectionReason,
} from "@/types/match";

/**
 * Espelha RejectMatchDialog (professional) — motivo obrigatório, sempre AlertDialog.
 *
 * Modo não-controlado (uso original, tela de matches): renderiza o próprio gatilho "Recusar".
 * Modo controlado (Kanban — soltar um card em "Reprovado"): passe `open`/`onOpenChange`/`hideTrigger`
 * e uma `key` estável (ex.: matchId) pra o formulário sempre começar limpo. `onRejected` dispara
 * após a recusa dar certo (o board usa pra invalidar o pipeline).
 */
export function RejectInterestDialog({
  matchId,
  open: openProp,
  onOpenChange,
  hideTrigger,
  onRejected,
}: {
  matchId: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  onRejected?: () => void;
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const [reasons, setReasons] = useState<CompanyRejectionReason[]>([]);
  const [description, setDescription] = useState("");
  const rejectMatch = useCompanyRejectMatch();

  function toggleReason(reason: CompanyRejectionReason) {
    setReasons((current) =>
      current.includes(reason)
        ? current.filter((r) => r !== reason)
        : [...current, reason]
    );
  }

  function setOpen(next: boolean) {
    // Só reseta no modo não-controlado; no controlado o pai remonta via `key`.
    if (next && openProp === undefined) {
      setReasons([]);
      setDescription("");
    }
    onOpenChange?.(next);
    setOpenState(next);
  }

  function handleConfirm(event: React.MouseEvent) {
    event.preventDefault();
    if (reasons.length === 0) return;
    rejectMatch.mutate(
      { matchId, reasons, description: description.trim() || null },
      {
        onSuccess: () => {
          toast.success("Interesse recusado.");
          setOpen(false);
          onRejected?.();
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível recusar."
          );
        },
      }
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="text-destructive" size="sm">
            <X className="size-4" />
            Recusar
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Recusar interesse</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione ao menos um motivo.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {companyRejectionReasonOptions.map(({ value, label }) => (
            <label
              key={value}
              className="hover:bg-accent flex items-center gap-2 rounded-md border p-2 text-sm"
            >
              <Checkbox
                checked={reasons.includes(value)}
                onCheckedChange={() => toggleReason(value)}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="companyRejectDescription"
            className="text-sm font-medium"
          >
            Adicione uma descrição do motivo da rejeição
          </label>
          <Textarea
            id="companyRejectDescription"
            rows={3}
            placeholder="Opcional — o candidato vai ver isso no card do match recusado"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={reasons.length === 0 || rejectMatch.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {rejectMatch.isPending ? "Recusando…" : "Confirmar recusa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
