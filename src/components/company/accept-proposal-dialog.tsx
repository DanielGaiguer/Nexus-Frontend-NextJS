"use client";

import { Check } from "lucide-react";
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
import { useAcceptProposal } from "@/hooks/mutations/useProposalMutations";
import { ApiError } from "@/lib/api-client";

/**
 * Aceitar confirma o Match (MATCHED) vinculado a essa proposta -- e, se a vaga esgotar com essa
 * aceitação, as demais propostas pendentes do mesmo projeto são auto-recusadas ("vaga
 * preenchida"). Por isso é um AlertDialog com aviso explícito, não um botão de ação direta.
 */
export function AcceptProposalDialog({
  proposalId,
  projectId,
  professionalName,
}: {
  proposalId: number;
  projectId: number;
  professionalName: string;
}) {
  const acceptProposal = useAcceptProposal();

  function handleConfirm() {
    acceptProposal.mutate(
      { proposalId, projectId },
      {
        onSuccess: () => toast.success("Proposta aceita! Match confirmado."),
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível aceitar a proposta."
          ),
      }
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm">
          <Check className="size-4" />
          Aceitar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Aceitar proposta de {professionalName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            O match com {professionalName} será confirmado e os contatos ficam
            disponíveis imediatamente. Se essa aceitação preencher todas as
            vagas do projeto, as demais propostas pendentes serão
            automaticamente marcadas como &quot;vaga preenchida&quot; e os
            demais candidatos serão notificados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={acceptProposal.isPending}
          >
            {acceptProposal.isPending ? "Aceitando…" : "Confirmar aceite"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
