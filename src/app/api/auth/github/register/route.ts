import { NextResponse } from "next/server";

/**
 * Cadastro via GitHub é sempre PROFESSIONAL — o backend
 * (AuthService#getGitHubRegisterUrl) não recebe `role`, então este handler
 * não repassa nenhum.
 */
export async function GET() {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8081";
  return NextResponse.redirect(
    new URL("/api/auth/github/register", backendUrl)
  );
}
