"use client";

import { MailCheck, TriangleAlert } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequestAccountDeletion } from "@/hooks/mutations/useAccountDeletion";
import { ApiError } from "@/lib/api-client";

/**
 * "Zona de perigo" — direito de eliminação (LGPD). O clique NÃO exclui nada:
 * dispara um e-mail de confirmação para o endereço da conta, e só o link do
 * e-mail (válido 48h) conclui a anonimização. Usado em /pro/profile e
 * /company/profile.
 */
export function DeleteAccountCard() {
  const requestDeletion = useRequestAccountDeletion();
  const [emailSent, setEmailSent] = useState(false);

  function handleConfirm() {
    requestDeletion.mutate(undefined, {
      onSuccess: (res) => {
        setEmailSent(true);
        toast.success(res.message);
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível iniciar a exclusão. Tente novamente."
        );
      },
    });
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2 text-sm">
          <TriangleAlert className="size-4" />
          Excluir minha conta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {emailSent ? (
          <div className="border-border bg-muted/40 flex items-start gap-2 rounded-md border p-3">
            <MailCheck className="text-primary mt-0.5 size-4 shrink-0" />
            <p className="text-muted-foreground">
              Enviamos um e-mail com o link de confirmação. Ele vale 48 horas.
              Nada é alterado enquanto você não confirmar. Se não solicitou
              isto, ignore o e-mail e troque sua senha.
            </p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground">
              Seus dados pessoais (nome, e-mail, telefone, foto, localização,
              portfólio) são anonimizados ou removidos. Matches e avaliações
              passam a exibir “Usuário removido”. Registros fiscais e
              financeiros já emitidos são mantidos pelo prazo exigido por lei.
              Esta ação é irreversível.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Excluir minha conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vamos enviar um e-mail para o endereço da sua conta com um
                    link para confirmar. A exclusão só acontece depois que você
                    clicar nesse link. Ele vale 48 horas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirm}
                    disabled={requestDeletion.isPending}
                  >
                    {requestDeletion.isPending
                      ? "Enviando…"
                      : "Enviar e-mail de confirmação"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}
