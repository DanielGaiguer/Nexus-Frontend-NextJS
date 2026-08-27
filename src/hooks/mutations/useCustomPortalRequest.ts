import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myCustomPortalKey } from "@/hooks/queries/useCustomPortal";
import { apiFetch } from "@/lib/api-client";
import type {
  CreateCustomPortalRequestBody,
  CustomPortalRequestDTO,
} from "@/types/custom-portal";

/** Contratante registra a solicitação de interesse pela plataforma personalizada. */
export function useRequestCustomPortal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCustomPortalRequestBody) =>
      apiFetch<CustomPortalRequestDTO>("/api/company/custom-portal/requests", {
        method: "POST",
        body,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: myCustomPortalKey() }),
  });
}
