import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Mesma ideia de `linkedin/login/route.ts`, pro fluxo de cadastro (`role=PROFESSIONAL|COMPANY`). */
export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8081";
  const role = request.nextUrl.searchParams.get("role") ?? "PROFESSIONAL";

  const target = new URL("/api/auth/linkedin/register", backendUrl);
  target.searchParams.set("role", role);

  return NextResponse.redirect(target);
}
