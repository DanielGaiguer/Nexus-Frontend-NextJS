"use client";

import { Mail, Phone } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dados de contato liberados por um match confirmado -- antes apareciam
 * inline, embaixo do botão "Entrar em contato" (crescendo o card e
 * empurrando o resto da lista); agora abrem numa janela. Controlado de
 * fora (open/onOpenChange) porque o botão "Entrar em contato" já existe
 * separadamente em cada card e é ele quem dispara a busca (enabled do
 * useCompanyContact/useProfessionalContact).
 */
export function ContactDialog({
  open,
  onOpenChange,
  isLoading,
  isError,
  email,
  phone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  isError: boolean;
  email: string | undefined;
  phone: string | null | undefined;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Dados de contato</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        )}

        {!isLoading && isError && (
          <p className="text-destructive text-sm">
            Não foi possível carregar o contato.
          </p>
        )}

        {!isLoading && !isError && email && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="text-primary size-4 shrink-0" />
              {email}
            </div>
            {phone && (
              <div className="flex items-center gap-2">
                <Phone className="text-primary size-4 shrink-0" />
                {phone}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
