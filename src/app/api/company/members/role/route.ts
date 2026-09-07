import { NextResponse } from "next/server";

import { getSessionToken } from "@/lib/session";
import type { CompanyRoleResponse } from "@/types/members";

/**
 * Papel do usuário logado dentro da conta empresarial. O JWT só carrega
 * role="COMPANY" (não OWNER/MEMBER), então o BFF deduz sondando o endpoint
 * OWNER-only GET /api/company/members: 200 => OWNER, 403 => MEMBER. Qualquer
 * outra coisa (sem sessão, sessão não-empresa) => null.
 *
 * A UI usa isto pra mostrar/esconder o que é exclusivo do OWNER (convidar,
 * remover, transferir titularidade) sem depender de um erro pra descobrir.
 */
export async function GET() {
  const token = await getSessionToken();

  const reply = (role: CompanyRoleResponse["role"]) =>
    NextResponse.json({ role } satisfies CompanyRoleResponse);

  if (!token) {
    return reply(null);
  }

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8081";
  const res = await fetch(`${backendUrl}/api/company/members`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.ok) {
    return reply("OWNER");
  }
  if (res.status === 403) {
    return reply("MEMBER");
  }
  return reply(null);
}
