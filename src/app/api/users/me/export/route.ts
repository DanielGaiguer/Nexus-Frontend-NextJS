import { proxyBinary } from "@/lib/route-handlers";

// Portabilidade de dados (LGPD). O backend devolve JSON com
// Content-Disposition: attachment; proxyBinary repassa o header e o corpo.
export async function GET() {
  return proxyBinary("/api/users/me/export", "application/json");
}
