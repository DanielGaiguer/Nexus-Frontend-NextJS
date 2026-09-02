import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { sidebarBadgesKey } from "@/hooks/queries/useSidebarBadges";
import { apiFetch } from "@/lib/api-client";

/**
 * Seções da sidebar do "Padrão B" -- badge = "houve atualização que você ainda
 * não viu", zerado ao abrir a seção. Espelha o enum SidebarSection do backend.
 */
export type SidebarSection =
  "PRO_MATCHES" | "PRO_PROPOSALS" | "COMPANY_CUSTOM_PORTAL";

/**
 * Registra o "visto" da seção ao montar E ao desmontar a página, e revalida os
 * badges da sidebar. Marcar também na saída cobre o caso de uma atualização
 * chegar enquanto o usuário estava na própria seção (ex.: no Matches, aceitar um
 * convite gera uma notificação de match confirmado pra ele mesmo) -- sem isso o
 * badge "re-acenderia" sozinho até a próxima visita. Falha é silenciosa: é só um
 * indicador, não pode quebrar a tela. Colocar no componente da página de cada
 * seção do Padrão B.
 */
export function useMarkSectionSeenOnMount(section: SidebarSection) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const mark = () =>
      apiFetch<void>(`/api/sidebar/sections/${section}/seen`, {
        method: "POST",
      })
        .then(() =>
          queryClient.invalidateQueries({ queryKey: sidebarBadgesKey() })
        )
        .catch(() => {
          /* indicador cosmético -- ignora falha */
        });
    mark();
    return () => {
      mark();
    };
  }, [section, queryClient]);
}
