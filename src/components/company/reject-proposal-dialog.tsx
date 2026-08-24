"use client";

import { X } from "lucide-react";
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
import { useRejectProposal } from "@/hooks/mutations/useProposalMutations";
import { ApiError } from "@/lib/api-client";

export function RejectProposalDialog({
  proposalId,
  projectId,
  professionalName,
}: {
  proposalId: number;
  projectId: number;
  professionalName: string;
}) {
  const rejectProposal = useRejectProposal();

  function handleConfirm() {
    rejectProposal.mutate(
      { proposalId, projectId },
      {
        onSuccess: () => toast.success("Proposta recusada."),
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível recusar a proposta."
          ),
      }
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <X className="size-4" />
          Recusar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Recusar proposta de {professionalName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {professionalName} será notificado de que a proposta foi recusada.
            Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={rejectProposal.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {rejectProposal.isPending ? "Recusando…" : "Confirmar recusa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
