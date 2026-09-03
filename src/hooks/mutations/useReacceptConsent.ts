import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ConsentStatusDTO, ReacceptConsentBody } from "@/types/legal";

// Re-aceite dos Termos na tela obrigatória (gate do layout autenticado).
export function useReacceptConsent() {
  return useMutation({
    mutationFn: (body: ReacceptConsentBody) =>
      apiFetch<ConsentStatusDTO>("/api/legal/consent/reaccept", {
        method: "POST",
        body,
      }),
  });
}
