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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToggleUser } from "@/hooks/mutations/useAdminUserActions";
import { ApiError } from "@/lib/api-client";

export function ToggleUserDialog({
  userId,
  email,
  active,
}: {
  userId: number;
  email: string;
  active: boolean;
}) {
  const toggleUser = useToggleUser();
  const action = active ? "desativar" : "ativar";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
          {active ? "Desativar" : "Ativar"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {active ? "Desativar" : "Ativar"} usuário
          </AlertDialogTitle>
          <AlertDialogDescription>
            Deseja {action} a conta de {email}? O usuário{" "}
            {active
              ? "perderá o acesso à plataforma."
              : "voltará a ter acesso normalmente."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={toggleUser.isPending}
            onClick={() =>
              toggleUser.mutate(userId, {
                onSuccess: () =>
                  toast.success("Status do usuário alterado com sucesso!"),
                onError: (error) =>
                  toast.error(
                    error instanceof ApiError
                      ? error.message
                      : "Não foi possível alterar o status."
                  ),
              })
            }
          >
            {active ? "Desativar" : "Ativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
