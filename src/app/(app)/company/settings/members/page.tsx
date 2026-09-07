import type { Metadata } from "next";

import { MembersManager } from "@/components/company/members-manager";

export const metadata: Metadata = { title: "Membros da equipe — Nexus" };

// Visível a qualquer sessão de empresa (o shell (app) + o proxy já garantem
// role=COMPANY). A distinção OWNER x MEMBER é feita dentro do componente:
// o OWNER vê a gestão completa; o MEMBER vê um painel só de leitura.
export default function CompanyMembersPage() {
  return <MembersManager />;
}
