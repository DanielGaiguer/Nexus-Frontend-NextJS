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
import { useRejectCompany } from "@/hooks/mutations/useAdminCompanyActions";
import { ApiError } from "@/lib/api-client";

export function RejectCompanyDialog({
  companyId,
  companyName,
}: {
  companyId: number;
  companyName: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const rejectCompany = useRejectCompany();

  function handleOpenChange(next: boolean) {
    if (next) setReason("");
    setOpen(next);
  }

  function handleConfirm(event: React.MouseEvent) {
    event.preventDefault();
    if (!reason.trim()) return;
    rejectCompany.mutate(
      { companyId, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Empresa rejeitada.");
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível rejeitar a empresa."
          ),
      }
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={(e) => e.stopPropagation()}
        >
          <X className="size-4" />
          Rejeitar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Rejeitar empresa</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja rejeitar o cadastro de <strong>{companyName}</strong>? A
            empresa não poderá acessar a plataforma. Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <label htmlFor="rejectCompanyReason" className="text-sm font-medium">
            Motivo da rejeição
          </label>
          <Textarea
            id="rejectCompanyReason"
            rows={3}
            required
            placeholder="Explique por que o cadastro está sendo rejeitado — esse texto será enviado por e-mail para a empresa."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!reason.trim() || rejectCompany.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {rejectCompany.isPending ? "Rejeitando…" : "Confirmar rejeição"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
