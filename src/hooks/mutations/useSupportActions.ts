import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type {
  OpenSupportConversationBody,
  OpenSupportTicketBody,
  SupportConversationDTO,
} from "@/types/support";

function useInvalidateSupport() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["support"] });
}

/** O usuário (profissional/contratante) abre um chamado de suporte. Idempotente
 * no backend (se já há um OPEN dele, a mensagem entra nesse thread). */
export function useOpenSupportTicket() {
  const invalidate = useInvalidateSupport();
  return useMutation({
    mutationFn: (body: OpenSupportTicketBody) =>
      apiFetch<SupportConversationDTO>("/api/support/conversations", {
        method: "POST",
        body,
      }),
    onSuccess: invalidate,
  });
}

/** Só o Admin abre uma conversa de suporte com um usuário. Idempotente no backend
 * (se já há uma OPEN com aquele usuário, devolve ela). */
export function useOpenSupportConversation() {
  const invalidate = useInvalidateSupport();
  return useMutation({
    mutationFn: (body: OpenSupportConversationBody) =>
      apiFetch<SupportConversationDTO>("/api/admin/support/conversations", {
        method: "POST",
        body,
      }),
    onSuccess: invalidate,
  });
}

/** Só o Admin fecha a conversa quando o caso é resolvido. */
export function useCloseSupportConversation() {
  const invalidate = useInvalidateSupport();
  return useMutation({
    mutationFn: (conversationId: number) =>
      apiFetch<SupportConversationDTO>(
        `/api/admin/support/conversations/${conversationId}/close`,
        { method: "POST" }
      ),
    onSuccess: invalidate,
  });
}
