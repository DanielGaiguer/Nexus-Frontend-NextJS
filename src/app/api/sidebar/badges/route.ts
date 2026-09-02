import { proxyToBackend } from "@/lib/route-handlers";

/** Contadores dos badges da sidebar do usuário logado (href -> contagem). */
export async function GET() {
  return proxyToBackend<Record<string, number>>("/api/sidebar/badges");
}
