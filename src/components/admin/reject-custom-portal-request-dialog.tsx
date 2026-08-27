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
import { Textarea } from "@/components/ui/textarea";
import { useRejectCustomPortalRequest } from "@/hooks/mutations/useAdminCustomPortalActions";
import { ApiError } from "@/lib/api-client";

export function RejectCustomPortalRequestDialog({
  requestId,
  companyName,
}: {
  requestId: number;
  companyName: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const reject = useRejectCustomPortalRequest();

  function handleOpenChange(next: boolean) {
    if (next) setReason("");
    setOpen(next);
  }

  function handleConfirm(event: React.MouseEvent) {
    event.preventDefault();
    if (!reason.trim()) return;
    reject.mutate(
      { requestId, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Solicitação recusada.");
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível recusar a solicitação."
          ),
      }
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <X className="size-4" />
          Recusar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Recusar solicitação</AlertDialogTitle>
          <AlertDialogDescription>
            Recusar a solicitação de plataforma personalizada de{" "}
            <strong>{companyName}</strong>? O contratante poderá solicitar
            novamente depois.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <label
            htmlFor="rejectCustomPortalReason"
            className="text-sm font-medium"
          >
            Motivo da recusa
          </label>
          <Textarea
            id="rejectCustomPortalReason"
            rows={3}
            required
            placeholder="Explique por que a solicitação está sendo recusada — esse texto será enviado por e-mail ao contratante."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!reason.trim() || reject.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {reject.isPending ? "Recusando…" : "Confirmar recusa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
