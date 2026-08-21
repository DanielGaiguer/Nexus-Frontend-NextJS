import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Mesma ideia de `linkedin/login/route.ts`, pro provedor GitHub. */
export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8081";
  const redirect = request.nextUrl.searchParams.get("redirect");

  const target = new URL("/api/auth/github/login", backendUrl);
  if (redirect) target.searchParams.set("redirect", redirect);

  return NextResponse.redirect(target);
}
