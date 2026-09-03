import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  LegalDocumentUnavailable,
  LegalDocumentView,
} from "@/components/legal/legal-document-view";
import { fetchLegalDocumentVersion } from "@/lib/legal-server";

export const metadata: Metadata = {
  title: "Termos de Uso — versão anterior — Nexus",
};

export const dynamic = "force-dynamic";

export default async function TermsVersionPage({
  params,
}: PageProps<"/terms/versions/[version]">) {
  const { version } = await params;
  const parsed = Number(version);
  if (!Number.isInteger(parsed) || parsed < 1) {
    notFound();
  }
  const doc = await fetchLegalDocumentVersion("terms", parsed);
  if (!doc) {
    return <LegalDocumentUnavailable label="Termos de Uso" />;
  }
  return <LegalDocumentView doc={doc} slug="terms" historical />;
}
