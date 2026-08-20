import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { ProfessionalCredentialDTO } from "@/types/professional";

export const credentialsKey = () => ["professional", "credentials"] as const;

export function useCredentials() {
  return useQuery({
    queryKey: credentialsKey(),
    queryFn: () =>
      apiFetch<ProfessionalCredentialDTO[]>("/api/professional/credentials"),
  });
}
