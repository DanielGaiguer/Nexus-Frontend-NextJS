import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  LegalDocumentUnavailable,
  LegalDocumentView,
} from "@/components/legal/legal-document-view";
import { fetchLegalDocumentVersion } from "@/lib/legal-server";

export const metadata: Metadata = {
  title: "Política de Privacidade — versão anterior — Nexus",
};

export const dynamic = "force-dynamic";

export default async function PrivacyVersionPage({
  params,
}: PageProps<"/privacy/versions/[version]">) {
  const { version } = await params;
  const parsed = Number(version);
  if (!Number.isInteger(parsed) || parsed < 1) {
    notFound();
  }
  const doc = await fetchLegalDocumentVersion("privacy", parsed);
  if (!doc) {
    return <LegalDocumentUnavailable label="Política de Privacidade" />;
  }
  return <LegalDocumentView doc={doc} slug="privacy" historical />;
}
