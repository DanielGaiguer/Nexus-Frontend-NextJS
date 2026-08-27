import { useMutation, useQueryClient } from "@tanstack/react-query";

import { opportunitiesKey } from "@/hooks/queries/useOpportunities";
import { sentInterestsKey } from "@/hooks/queries/useMatches";
import { apiFetch } from "@/lib/api-client";
import type { MatchActionResponseDTO } from "@/types/match";

/**
 * Profissional demonstra interesse numa vaga/projeto (pro-opportunities.html). Se a vaga tiver
 * um questionário de triagem obrigatório ainda não respondido, o backend devolve
 * screeningRequired=true em vez de registrar o interesse -- quem chama deve redirecionar pra
 * `/pro/screening-invitations/{screeningInvitationId}/take` nesse caso, sem invalidar nada ainda
 * (o interesse só é registrado de fato quando o questionário for enviado).
 */
export function useShowInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: number) =>
      apiFetch<MatchActionResponseDTO>(
        `/api/professional/opportunities/${projectId}/interest`,
        { method: "POST" }
      ),
    onSuccess: (data) => {
      if (data.screeningRequired) return;
      queryClient.invalidateQueries({ queryKey: opportunitiesKey() });
      queryClient.invalidateQueries({ queryKey: sentInterestsKey() });
    },
  });
}
