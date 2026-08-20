import { proxyToBackend } from "@/lib/route-handlers";

export async function POST(request: Request) {
  const formData = await request.formData();
  // O backend devolve a URL como texto puro (ResponseEntity<String>).
  return proxyToBackend<string, { url: string }>(
    "/api/professional/profile/photo",
    { method: "POST", body: formData, transform: (url) => ({ url }) }
  );
}

export async function DELETE() {
  return proxyToBackend<string, { message: string }>(
    "/api/professional/profile/photo",
    { method: "DELETE", transform: (message) => ({ message }) }
  );
}
