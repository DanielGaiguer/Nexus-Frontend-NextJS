import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CandidateEvaluationItemDTO,
  CandidateEvaluationRequestDTO,
} from "@/types/candidate";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/pipeline/matches/[matchId]/evaluations/mine">
) {
  const { projectId, matchId } = await ctx.params;
  const body = (await request.json()) as CandidateEvaluationRequestDTO;
  return proxyToBackend<CandidateEvaluationItemDTO>(
    `/api/projects/${projectId}/pipeline/matches/${matchId}/evaluations/mine`,
    { method: "PUT", body }
  );
}
