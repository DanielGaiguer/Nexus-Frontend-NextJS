import { NextResponse } from "next/server";

import { ApiError, backendFetch } from "@/lib/api-client";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import type { LoginRequestDTO, LoginResponseDTO } from "@/types/auth";

/**
 * BFF de login: recebe email/senha do form, repassa pro Spring Boot
 * (`POST /api/auth/login`), e — só se o backend confirmar — planta o JWT
 * num cookie httpOnly. O browser nunca vê `response.token`; a resposta pro
 * client só carrega o que a UI precisa pra decidir pra onde navegar.
 */
export async function POST(request: Request) {
  const credentials = (await request.json()) as LoginRequestDTO;

  try {
    const session = await backendFetch<LoginResponseDTO>("/api/auth/login", {
      method: "POST",
      body: credentials,
    });

    const response = NextResponse.json({
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    });

    response.cookies.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, reason: error.reason },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { message: "Não foi possível entrar. Tente novamente." },
      { status: 502 }
    );
  }
}
