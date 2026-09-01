import { proxyToBackend } from "@/lib/route-handlers";
import type {
  AdminMatchConfirmationDTO,
  AdminResolveConfirmationBody,
} from "@/types/admin";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/confirmations/[matchId]/resolve">
) {
  const { matchId } = await ctx.params;
  const body = (await request.json()) as AdminResolveConfirmationBody;
  return proxyToBackend<AdminMatchConfirmationDTO>(
    `/api/admin/confirmations/${matchId}/resolve`,
    { method: "POST", body }
  );
}
