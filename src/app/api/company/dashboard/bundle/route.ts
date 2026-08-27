import { NextResponse } from "next/server";

import { ApiError, backendFetch } from "@/lib/api-client";
import { getSessionToken } from "@/lib/session";
import type {
  CompanyDashboardBundleDTO,
  CompanyDashboardDTO,
  CompanyProfileDTO,
} from "@/types/company";
import type { MatchResponseDTO } from "@/types/match";
import type { ProjectResponseDTO } from "@/types/project";
import type { PendingReviewDTO, PendingStatusCheckDTO } from "@/types/review";

/**
 * Rota agregada da tela `/company/dashboard`. Em vez de o browser disparar
 * ~7 requests (cada um um Route Handler frio no `next dev` + duplo hop
 * browser -> Next -> Spring), dispara um só; o fan-out pro Spring acontece
 * aqui, server-side e em paralelo — inclusive os dois endpoints lentos
 * (`/api/projects/matches/confirmed` e `/api/projects/previous`), que assim
 * deixam de bloquear a pintura da tela na esteira do client.
 *
 * Os endpoints individuais continuam existindo pra quem os usa fora do
 * dashboard — ver `useCompanyDashboardBundle` pro seeding do cache.
 *
 * Resiliência: `profile` e `summary` são a identidade + os contadores da
 * tela; se qualquer um falhar, a request inteira falha (a tela já não
 * renderizava sem eles antes). As outras cinco chamadas degradam pro vazio
 * individualmente (lista vazia / `null`), igual a quando cada `useQuery`
 * falhava sozinho.
 */

/** Lista do backend, ou `[]` se a chamada falhar (degrada como o useQuery). */
async function safeList<T>(path: string, token: string): Promise<T[]> {
  try {
    return await backendFetch<T[]>(path, { token });
  } catch {
    return [];
  }
}

/** 404 (ou qualquer falha) nesses dois só quer dizer "nada pendente" — `null`. */
async function safePending<T>(path: string, token: string): Promise<T | null> {
  try {
    return await backendFetch<T>(path, { token });
  } catch {
    return null;
  }
}

export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json(
      { message: "Sessão inválida ou expirada." },
      { status: 401 }
    );
  }

  try {
    const [
      profile,
      summary,
      projects,
      confirmedMatches,
      previousMatches,
      pendingStatusCheck,
      pendingReview,
    ] = await Promise.all([
      backendFetch<CompanyProfileDTO>("/api/company/profile", { token }),
      backendFetch<CompanyDashboardDTO>("/api/company/dashboard", { token }),
      safeList<ProjectResponseDTO>("/api/projects", token),
      safeList<MatchResponseDTO>("/api/projects/matches/confirmed", token),
      safeList<MatchResponseDTO>("/api/projects/previous", token),
      safePending<PendingStatusCheckDTO>(
        "/api/matches/status-check/pending",
        token
      ),
      safePending<PendingReviewDTO>("/api/reviews/pending/company", token),
    ]);

    const bundle: CompanyDashboardBundleDTO = {
      profile,
      summary,
      projects,
      confirmedMatches,
      previousMatches,
      pendingStatusCheck,
      pendingReview,
    };
    return NextResponse.json(bundle);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, reason: error.reason },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { message: "Não foi possível falar com o servidor. Tente novamente." },
      { status: 502 }
    );
  }
}
