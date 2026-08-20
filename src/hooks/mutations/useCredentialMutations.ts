import { useMutation, useQueryClient } from "@tanstack/react-query";

import { credentialsKey } from "@/hooks/queries/useCredentials";
import { apiFetch } from "@/lib/api-client";
import type { ProfessionalCredentialDTO } from "@/types/professional";

type CredentialInput = Omit<ProfessionalCredentialDTO, "id">;

export function useAddCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credential: CredentialInput) =>
      apiFetch<{ message: string }>("/api/professional/credentials", {
        method: "POST",
        body: credential,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: credentialsKey() }),
  });
}

export function useUpdateCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...credential }: ProfessionalCredentialDTO) =>
      apiFetch<{ message: string }>(`/api/professional/credentials/${id}`, {
        method: "PUT",
        body: { id, ...credential },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: credentialsKey() }),
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ message: string }>(`/api/professional/credentials/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: credentialsKey() }),
  });
}
