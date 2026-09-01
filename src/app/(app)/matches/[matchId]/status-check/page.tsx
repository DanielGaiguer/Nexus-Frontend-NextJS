import { redirect } from "next/navigation";

import { StatusCheckPageContent } from "@/components/matches/status-check-page-content";
import { getSession } from "@/lib/session";

/**
 * Confirmação da contratação (30 dias) — agora respondida pelos DOIS lados
 * (contratante e profissional). Ver MatchStatusCheckController no backend.
 */
export default async function MatchStatusCheckPage({
  params,
}: PageProps<"/matches/[matchId]/status-check">) {
  const { matchId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COMPANY" && session.role !== "PROFESSIONAL") {
    redirect("/admin/dashboard");
  }

  return (
    <StatusCheckPageContent
      matchId={Number(matchId)}
      role={session.role === "COMPANY" ? "company" : "professional"}
    />
  );
}
