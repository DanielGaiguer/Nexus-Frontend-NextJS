import type { Metadata } from "next";

import { LegalVersionList } from "@/components/legal/legal-version-list";
import { fetchLegalDocumentVersions } from "@/lib/legal-server";

export const metadata: Metadata = {
  title: "Termos de Uso — versões — Nexus",
};

export const dynamic = "force-dynamic";

export default async function TermsVersionsPage() {
  const versions = await fetchLegalDocumentVersions("terms");
  return (
    <LegalVersionList slug="terms" label="Termos de Uso" versions={versions} />
  );
}
