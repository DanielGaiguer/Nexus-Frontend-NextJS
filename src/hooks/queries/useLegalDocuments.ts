import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { AdminLegalOverviewDTO } from "@/types/legal";

export const legalDocumentsKey = () => ["admin", "legal-documents"] as const;

// Painel do Admin: versão ativa + histórico de Termos e Política.
export function useLegalDocuments() {
  return useQuery({
    queryKey: legalDocumentsKey(),
    queryFn: () =>
      apiFetch<AdminLegalOverviewDTO>("/api/admin/legal-documents"),
  });
}
