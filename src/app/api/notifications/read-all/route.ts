import { proxyToBackend } from "@/lib/route-handlers";

export async function PUT() {
  return proxyToBackend<string, { message: string }>(
    "/api/notifications/read-all",
    { method: "PUT", transform: (message) => ({ message }) }
  );
}
