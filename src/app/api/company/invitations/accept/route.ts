import { NextResponse } from "next/server";

import { ApiError, backendFetch } from "@/lib/api-client";
import { rateLimitAware } from "@/lib/route-handlers";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session";
import type { LoginResponseDTO } from "@/types/auth";
import type { AcceptInvitationRequestBody } from "@/types/members";

/**
 * Aceite de convite de membro — rota pública (o token do e-mail é a credencial;
 * ver PUBLIC_PATHS em src/proxy.ts e o permitAll no SecurityConfig do backend).
 * O backend cria a conta e devolve um JWT; aqui plantamos o mesmo cookie
 * httpOnly que /api/auth/login usa, e o browser nunca vê o token. Substitui
 * qualquer sessão anterior — quem aceitar um convite fica logado como o novo
 * membro.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as AcceptInvitationRequestBody;

  try {
    const session = await backendFetch<LoginResponseDTO>(
      "/api/company/invitations/accept",
      { method: "POST", body }
    );

    const response = NextResponse.json({
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      session.token,
      sessionCookieOptions()
    );
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return rateLimitAware(
        { message: error.message, reason: error.reason },
        error
      );
    }
    return NextResponse.json(
      { message: "Não foi possível concluir o convite. Tente novamente." },
      { status: 502 }
    );
  }
}
