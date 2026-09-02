import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

export const sidebarBadgesKey = () => ["sidebar", "badges"] as const;

/**
 * Contadores dos badges da sidebar (href do item -> contagem). Só vêm os
 * itens com contagem > 0. Recalculado no backend a cada chamada -- sem tempo
 * real, só polling (rule: "recalculada quando a sidebar carrega/atualiza").
 *
 * Não cobre "Conversas" nem "Suporte" -- esses têm badge próprio
 * (useChatUnreadTotal / useSupportUnreadTotal), mantido em tempo real.
 */
export function useSidebarBadges() {
  return useQuery({
    queryKey: sidebarBadgesKey(),
    queryFn: () => apiFetch<Record<string, number>>("/api/sidebar/badges"),
    refetchInterval: 60 * 1000,
  });
}
