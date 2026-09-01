import { proxyToBackend } from "@/lib/route-handlers";
import type {
  AdminConfirmationReviewBody,
  AdminMatchConfirmationDTO,
} from "@/types/admin";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/confirmations/[matchId]/review">
) {
  const { matchId } = await ctx.params;
  const body = (await request.json()) as AdminConfirmationReviewBody;
  return proxyToBackend<AdminMatchConfirmationDTO>(
    `/api/admin/confirmations/${matchId}/review`,
    { method: "POST", body }
  );
}
