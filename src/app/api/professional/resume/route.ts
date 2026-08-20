import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(request: Request) {
  const formData = await request.formData();
  return proxyToBackend<string, { message: string }>(
    "/api/professional/resume",
    { method: "POST", body: formData, transform: (message) => ({ message }) }
  );
}
