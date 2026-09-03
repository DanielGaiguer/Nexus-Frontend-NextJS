import { useMutation, useQueryClient } from "@tanstack/react-query";

import { legalDocumentsKey } from "@/hooks/queries/useLegalDocuments";
import { apiFetch } from "@/lib/api-client";
import type {
  LegalDocumentDTO,
  LegalDocumentSlug,
  PublishLegalDocumentBody,
} from "@/types/legal";

// Admin publica uma nova versão de Termos ou Política. Publicar Termos dispara
// o re-aceite obrigatório para todo usuário com aceite de versão anterior.
export function usePublishLegalDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      body,
    }: {
      slug: LegalDocumentSlug;
      body: PublishLegalDocumentBody;
    }) =>
      apiFetch<LegalDocumentDTO>(
        `/api/admin/legal-documents/${slug}/versions`,
        { method: "POST", body }
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: legalDocumentsKey() }),
  });
}
