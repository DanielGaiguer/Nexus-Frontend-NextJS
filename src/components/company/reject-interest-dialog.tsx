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

/** Espelha RejectMatchDialog (professional) — motivo obrigatório, sempre AlertDialog. */
export function RejectInterestDialog({ matchId }: { matchId: number }) {
  const [open, setOpen] = useState(false);
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

  function handleOpenChange(next: boolean) {
    if (next) {
      setReasons([]);
      setDescription("");
    }
    setOpen(next);
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
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-destructive" size="sm">
          <X className="size-4" />
          Recusar
        </Button>
      </AlertDialogTrigger>
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
