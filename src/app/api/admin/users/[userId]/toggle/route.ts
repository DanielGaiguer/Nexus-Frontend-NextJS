import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/admin/users/[userId]/toggle">
) {
  const { userId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/admin/users/${userId}/toggle`,
    {
      method: "POST",
      transform: (message) => ({ message }),
    }
  );
}
