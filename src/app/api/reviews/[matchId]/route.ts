import { proxyToBackend } from "@/lib/route-handlers";
import type { ReviewRequestDTO } from "@/types/review";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/reviews/[matchId]">
) {
  const { matchId } = await ctx.params;
  const body = (await request.json()) as ReviewRequestDTO;
  return proxyToBackend<string, { message: string }>(
    `/api/reviews/${matchId}`,
    {
      method: "POST",
      body,
      transform: (message) => ({ message }),
    }
  );
}
