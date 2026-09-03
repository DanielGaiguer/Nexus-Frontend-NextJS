// Só para Server Components — usa backendFetch (server-side).
import { backendFetch } from "@/lib/api-client";
import { getSessionToken } from "@/lib/session";
import type {
  ConsentStatusDTO,
  LegalDocumentDTO,
  LegalDocumentSlug,
  LegalDocumentVersionDTO,
} from "@/types/legal";

/** Versão ativa de um documento legal. `null` se indisponível. */
export async function fetchActiveLegalDocument(
  slug: LegalDocumentSlug
): Promise<LegalDocumentDTO | null> {
  try {
    return await backendFetch<LegalDocumentDTO>(`/api/public/legal/${slug}`);
  } catch {
    return null;
  }
}

/** Histórico de versões (sem conteúdo). `[]` se indisponível. */
export async function fetchLegalDocumentVersions(
  slug: LegalDocumentSlug
): Promise<LegalDocumentVersionDTO[]> {
  try {
    return await backendFetch<LegalDocumentVersionDTO[]>(
      `/api/public/legal/${slug}/versions`
    );
  } catch {
    return [];
  }
}

/** Uma versão específica, com conteúdo. `null` se não existir. */
export async function fetchLegalDocumentVersion(
  slug: LegalDocumentSlug,
  version: number
): Promise<LegalDocumentDTO | null> {
  try {
    return await backendFetch<LegalDocumentDTO>(
      `/api/public/legal/${slug}/versions/${version}`
    );
  } catch {
    return null;
  }
}

export const LEGAL_SLUG_LABEL: Record<LegalDocumentSlug, string> = {
  terms: "Termos de Uso",
  privacy: "Política de Privacidade",
};

/**
 * Estado de consentimento do usuário logado — consumido pelo layout
 * autenticado para decidir se mostra a tela de re-aceite. Em qualquer falha
 * retorna `null`: o gate trata `null` como "não reter" (o ConsentGateFilter no
 * backend ainda barra chamadas mutáveis, então não há brecha real).
 */
export async function fetchConsentStatus(): Promise<ConsentStatusDTO | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    return await backendFetch<ConsentStatusDTO>("/api/legal/consent/status", {
      token,
    });
  } catch {
    return null;
  }
}
