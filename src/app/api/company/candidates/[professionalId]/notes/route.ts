import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CompanyCandidateNoteDTO,
  CompanyCandidateNoteRequestDTO,
} from "@/types/candidate";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/company/candidates/[professionalId]/notes">
) {
  const { professionalId } = await ctx.params;
  const qs = new URL(request.url).searchParams.toString();
  return proxyToBackend<CompanyCandidateNoteDTO[]>(
    `/api/company/candidates/${professionalId}/notes${qs ? `?${qs}` : ""}`
  );
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/company/candidates/[professionalId]/notes">
) {
  const { professionalId } = await ctx.params;
  const body = (await request.json()) as CompanyCandidateNoteRequestDTO;
  return proxyToBackend<CompanyCandidateNoteDTO>(
    `/api/company/candidates/${professionalId}/notes`,
    { method: "POST", body }
  );
}
