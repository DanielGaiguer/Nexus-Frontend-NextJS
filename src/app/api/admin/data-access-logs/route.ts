import { proxyToBackend } from "@/lib/route-handlers";
import type { DataAccessLogPageDTO } from "@/types/audit";

// Consulta do log de auditoria de acesso administrativo (LGPD). Só leitura.
export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyToBackend<DataAccessLogPageDTO>(
    `/api/admin/data-access-logs${search}`
  );
}
