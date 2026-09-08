import { proxyToBackend } from "@/lib/route-handlers";
import type { CandidateEvaluationSummaryDTO } from "@/types/candidate";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/pipeline/matches/[matchId]/evaluations">
) {
  const { projectId, matchId } = await ctx.params;
  return proxyToBackend<CandidateEvaluationSummaryDTO>(
    `/api/projects/${projectId}/pipeline/matches/${matchId}/evaluations`
  );
}
