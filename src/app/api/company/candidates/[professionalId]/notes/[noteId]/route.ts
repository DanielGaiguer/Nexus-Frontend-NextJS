import { proxyToBackend } from "@/lib/route-handlers";
import type {
  CompanyCandidateNoteDTO,
  CompanyCandidateNoteUpdateDTO,
} from "@/types/candidate";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/company/candidates/[professionalId]/notes/[noteId]">
) {
  const { professionalId, noteId } = await ctx.params;
  const body = (await request.json()) as CompanyCandidateNoteUpdateDTO;
  return proxyToBackend<CompanyCandidateNoteDTO>(
    `/api/company/candidates/${professionalId}/notes/${noteId}`,
    { method: "PUT", body }
  );
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/company/candidates/[professionalId]/notes/[noteId]">
) {
  const { professionalId, noteId } = await ctx.params;
  return proxyToBackend<{ message: string }>(
    `/api/company/candidates/${professionalId}/notes/${noteId}`,
    { method: "DELETE" }
  );
}
