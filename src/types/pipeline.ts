import type { ProfessionalSummaryDTO, StatusMatch } from "./match";
import type { ScreeningInvitationSummaryDTO } from "./screening";

/** Espelha com.main.nexus.dto.PipelineStageDTO — uma coluna intermediária do board. */
export interface PipelineStageDTO {
  id: number;
  name: string;
  orderIndex: number;
  active: boolean;
}

/**
 * Espelha com.main.nexus.dto.PipelineCardColumnDTO — a coluna EFETIVA de um card, já resolvida
 * pelo backend. `kind: "STAGE"` é a única arrastável; `"HIRED"`/`"REJECTED"` são colunas terminais
 * derivadas do estado real do match. `subLabel` é o texto fino da coluna terminal (ex.: "Match
 * expirado — sem confirmação") ou "Etapa arquivada".
 */
export interface PipelineCardColumnDTO {
  kind: "STAGE" | "HIRED" | "REJECTED";
  stageId: number | null;
  subLabel: string | null;
}

/**
 * Espelha com.main.nexus.dto.PipelineCardEvaluationDTO — o scorecard humano do card (1-5).
 * DISTINTO do matchScore algorítmico (0-100). `average` é null quando count === 0.
 */
export interface PipelineCardEvaluationDTO {
  average: number | null;
  count: number;
}

/** Espelha com.main.nexus.dto.PipelineCardDTO. */
export interface PipelineCardDTO {
  matchId: number;
  professional: ProfessionalSummaryDTO;
  matchScore: number | null;
  evaluation: PipelineCardEvaluationDTO;
  status: StatusMatch;
  active: boolean | null;
  draggable: boolean;
  column: PipelineCardColumnDTO;
  latestScreening: ScreeningInvitationSummaryDTO | null;
}

/** Espelha com.main.nexus.dto.PipelineBoardDTO. */
export interface PipelineBoardDTO {
  projectId: number;
  stages: PipelineStageDTO[];
  cards: PipelineCardDTO[];
}

/** Espelha com.main.nexus.dto.PipelineStageRequestDTO. `id` nulo = coluna nova. */
export interface PipelineStageRequestDTO {
  id: number | null;
  name: string;
}

/** Espelha com.main.nexus.dto.PipelineStagesRequestDTO — substitui a lista inteira de etapas. */
export interface PipelineStagesRequestDTO {
  stages: PipelineStageRequestDTO[];
}

/** Espelha com.main.nexus.dto.MovePipelineCardRequestDTO. */
export interface MovePipelineCardRequestDTO {
  stageId: number;
}
