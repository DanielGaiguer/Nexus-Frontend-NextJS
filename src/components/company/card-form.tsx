"use client";

import { toast } from "sonner";

import { CardBrick } from "@/components/company/card-brick";
import { useSaveCard } from "@/hooks/mutations/useBillingActions";
import { ApiError } from "@/lib/api-client";

/**
 * Cadastro do cartão de cobrança de comissão (Prompt 5). Casca fina sobre o
 * CardBrick genérico — o token gerado no browser vai para `useSaveCard`.
 */
export function CardForm({
  publicKey,
  onSaved,
}: {
  publicKey: string;
  onSaved: () => void;
}) {
  const saveCard = useSaveCard();

  return (
    <CardBrick
      publicKey={publicKey}
      containerId="mp-card-brick-container"
      onToken={(token) =>
        saveCard
          .mutateAsync(token)
          .then(() => {
            toast.success("Cartão salvo.");
            onSaved();
          })
          .catch((error) => {
            toast.error(
              error instanceof ApiError
                ? error.message
                : "Não foi possível salvar o cartão."
            );
            throw error;
          })
      }
    />
  );
}
