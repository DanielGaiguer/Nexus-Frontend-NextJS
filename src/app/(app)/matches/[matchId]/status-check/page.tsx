import { redirect } from "next/navigation";

import { StatusCheckPageContent } from "@/components/matches/status-check-page-content";
import { getSession } from "@/lib/session";

/** Só empresa responde status check (ver MatchStatusCheckController no backend). */
export default async function MatchStatusCheckPage({
  params,
}: PageProps<"/matches/[matchId]/status-check">) {
  const { matchId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COMPANY") redirect("/pro/matches");

  return <StatusCheckPageContent matchId={Number(matchId)} />;
}
