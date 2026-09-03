import type { Metadata } from "next";

import {
  LegalDocumentUnavailable,
  LegalDocumentView,
} from "@/components/legal/legal-document-view";
import { fetchActiveLegalDocument } from "@/lib/legal-server";

export const metadata: Metadata = { title: "Política de Privacidade — Nexus" };

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const doc = await fetchActiveLegalDocument("privacy");
  if (!doc) {
    return <LegalDocumentUnavailable label="Política de Privacidade" />;
  }
  return <LegalDocumentView doc={doc} slug="privacy" />;
}
