import type { Metadata } from "next";

import {
  LegalDocumentUnavailable,
  LegalDocumentView,
} from "@/components/legal/legal-document-view";
import { fetchActiveLegalDocument } from "@/lib/legal-server";

export const metadata: Metadata = { title: "Termos de Uso — Nexus" };

// Sempre a versão ativa. Sem cache entre requests (backendFetch usa no-store).
export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const doc = await fetchActiveLegalDocument("terms");
  if (!doc) {
    return <LegalDocumentUnavailable label="Termos de Uso" />;
  }
  return <LegalDocumentView doc={doc} slug="terms" />;
}
