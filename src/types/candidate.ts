/**
 * Painel de detalhe interno do candidato no Kanban de contratação (Prompts 2 e 3 do backend).
 * Notas internas e scorecard são COMPANY-only -- nunca vão pro profissional.
 */

/** Espelha com.main.nexus.dto.CompanyCandidateNoteDTO. `canEdit` já vem calculado pro membro logado. */
export interface CompanyCandidateNoteDTO {
  id: number;
  professionalId: number;
  matchId: number | null;
  authorMemberId: number | null;
  authorUserId: number | null;
  authorLabel: string;
  canEdit: boolean;
  body: string;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de POST .../notes. */
export interface CompanyCandidateNoteRequestDTO {
  matchId: number | null;
  body: string;
}

/** Corpo de PUT .../notes/{id}. */
export interface CompanyCandidateNoteUpdateDTO {
  body: string;
}

/** Espelha com.main.nexus.dto.CandidateEvaluationItemDTO. `mine` marca o parecer do membro logado. */
export interface CandidateEvaluationItemDTO {
  evaluatorMemberId: number | null;
  evaluatorUserId: number | null;
  evaluatorLabel: string;
  rating: number;
  comment: string | null;
  mine: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Espelha com.main.nexus.dto.CandidateEvaluationSummaryDTO. `average` (1-5, ao vivo) é null quando count === 0. */
export interface CandidateEvaluationSummaryDTO {
  average: number | null;
  count: number;
  items: CandidateEvaluationItemDTO[];
}

/** Corpo de PUT .../evaluations/mine. */
export interface CandidateEvaluationRequestDTO {
  rating: number;
  comment: string | null;
}
