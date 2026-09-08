"use client";

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
} from "@/components/ui/alert-dialog";
import { useCompanyAcceptMatch } from "@/hooks/mutations/useCompanyMatchActions";
import { ApiError } from "@/lib/api-client";

/**
 * Confirmação pra "soltar o card em Contratado" -- não é um caminho novo: chama exatamente a
 * mesma ação real de aceitar o interesse do profissional (useCompanyAcceptMatch ->
 * POST /api/matches/{id}/company-accept), a mesma do botão "Aceitar" da tela de matches. Só faz
 * sentido quando o match está PROFESSIONAL_INTERESTED (o board já filtra isso antes de abrir).
 * Controlado; o board o remonta via `key`.
 */
export function ConfirmHireDialog({
  matchId,
  professionalName,
  open,
  onOpenChange,
  onHired,
}: {
  matchId: number;
  professionalName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHired?: () => void;
}) {
  const acceptMatch = useCompanyAcceptMatch();

  function confirm() {
    acceptMatch.mutate(matchId, {
      onSuccess: () => {
        toast.success("Match confirmado! Contato liberado.");
        onOpenChange(false);
        onHired?.();
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível confirmar a contratação."
        );
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Marcar como contratado?</AlertDialogTitle>
          <AlertDialogDescription>
            Isto confirma o interesse de <strong>{professionalName}</strong> e
            fecha o match. Os dados de contato do profissional ficam disponíveis
            e a vaga preenche uma posição.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirm} disabled={acceptMatch.isPending}>
            {acceptMatch.isPending ? "Confirmando…" : "Confirmar contratação"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
