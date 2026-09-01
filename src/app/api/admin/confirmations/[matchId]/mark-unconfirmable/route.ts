import { proxyToBackend } from "@/lib/route-handlers";
import type {
  AdminMatchConfirmationDTO,
  AdminUnconfirmableBody,
} from "@/types/admin";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/confirmations/[matchId]/mark-unconfirmable">
) {
  const { matchId } = await ctx.params;
  const body = (await request.json()) as AdminUnconfirmableBody;
  return proxyToBackend<AdminMatchConfirmationDTO>(
    `/api/admin/confirmations/${matchId}/mark-unconfirmable`,
    { method: "POST", body }
  );
}
