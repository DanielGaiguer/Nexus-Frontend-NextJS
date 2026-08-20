import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(request: Request) {
  const formData = await request.formData();
  return proxyToBackend<string, { url: string }>("/api/company/profile/photo", {
    method: "POST",
    body: formData,
    transform: (url) => ({ url }),
  });
}

export async function DELETE() {
  return proxyToBackend<string, { message: string }>(
    "/api/company/profile/photo",
    {
      method: "DELETE",
      transform: (message) => ({ message }),
    }
  );
}
