import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/proposals/[proposalId]/withdraw">
) {
  const { proposalId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/proposals/${proposalId}/withdraw`,
    { method: "POST", transform: (message) => ({ message }) }
  );
}
