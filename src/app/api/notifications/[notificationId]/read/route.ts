import { proxyToBackend } from "@/lib/route-handlers";

export async function PUT(
  _request: Request,
  ctx: RouteContext<"/api/notifications/[notificationId]/read">
) {
  const { notificationId } = await ctx.params;
  return proxyToBackend<string, { message: string }>(
    `/api/notifications/${notificationId}/read`,
    { method: "PUT", transform: (message) => ({ message }) }
  );
}
