import { redirect } from "next/navigation";

import { ReviewPageContent } from "@/components/reviews/review-page-content";
import { getSession } from "@/lib/session";

/**
 * Server Component só pra resolver o `authorType` a partir da sessão — o
 * client component não tem acesso ao papel logado sem isso (rota fica fora
 * de /pro/** e /company/**, então não herda role de um layout específico).
 */
export default async function MatchReviewPage({
  params,
}: PageProps<"/matches/[matchId]/review">) {
  const { matchId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "ADMIN") redirect("/admin/dashboard");

  return (
    <ReviewPageContent
      matchId={Number(matchId)}
      authorType={session.role === "PROFESSIONAL" ? "PROFESSIONAL" : "COMPANY"}
    />
  );
}
