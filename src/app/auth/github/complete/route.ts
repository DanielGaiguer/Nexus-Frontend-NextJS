import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from "@/lib/session";
import type { UserRole } from "@/types/auth";

const roleHome: Record<UserRole, string> = {
  PROFESSIONAL: "/pro/dashboard",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/dashboard",
};

/** Mesma ideia de `linkedin/complete/route.ts`, pro callback do GitHub. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token = params.get("token");
  const redirect = params.get("redirect");

  const claims = token ? await verifySessionToken(token) : null;
  if (!token || !claims) {
    return NextResponse.redirect(
      new URL("/login?githubError=failed", request.url)
    );
  }

  const target =
    redirect && redirect.startsWith("/") ? redirect : roleHome[claims.role];
  const response = NextResponse.redirect(new URL(target, request.url));
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
