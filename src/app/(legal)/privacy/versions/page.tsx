import type { Metadata } from "next";

import { LegalVersionList } from "@/components/legal/legal-version-list";
import { fetchLegalDocumentVersions } from "@/lib/legal-server";

export const metadata: Metadata = {
  title: "Política de Privacidade — versões — Nexus",
};

export const dynamic = "force-dynamic";

export default async function PrivacyVersionsPage() {
  const versions = await fetchLegalDocumentVersions("privacy");
  return (
    <LegalVersionList
      slug="privacy"
      label="Política de Privacidade"
      versions={versions}
    />
  );
}
