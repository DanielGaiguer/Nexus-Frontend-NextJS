"use client";

import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ListOrdered } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CandidateDetailDialog } from "@/components/company/pipeline/candidate-detail-dialog";
import { ConfirmHireDialog } from "@/components/company/pipeline/confirm-hire-dialog";
import { PipelineCard } from "@/components/company/pipeline/pipeline-card";
import { PipelineStageManager } from "@/components/company/pipeline/pipeline-stage-manager";
import { RejectInterestDialog } from "@/components/company/reject-interest-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMovePipelineCard } from "@/hooks/mutations/usePipelineActions";
import {
  pipelineBoardKey,
  usePipelineBoard,
} from "@/hooks/queries/usePipelineBoard";
import { useProject } from "@/hooks/queries/useMyProjects";
import { cn } from "@/lib/utils";
import type { PipelineCardDTO, PipelineStageDTO } from "@/types/pipeline";

const HIRED = "hired";
const REJECTED = "rejected";

function columnKeyOf(card: PipelineCardDTO): string {
  if (card.column.kind === "HIRED") return HIRED;
  if (card.column.kind === "REJECTED") return REJECTED;
  return String(card.column.stageId);
}

function DraggableCard({
  card,
  onOpen,
}: {
  card: PipelineCardDTO;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(card.matchId),
    disabled: !card.draggable,
  });
  return (
    <div ref={setNodeRef}>
      <PipelineCard
        card={card}
        isDragging={isDragging}
        onOpen={onOpen}
        dragHandleProps={
          card.draggable ? { ...attributes, ...listeners } : undefined
        }
      />
    </div>
  );
}

function Column({
  id,
  title,
  count,
  tone,
  isDropTarget,
  children,
}: {
  id: string;
  title: string;
  count: number;
  tone?: "hired" | "rejected";
  isDropTarget: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: !isDropTarget });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-muted/30 flex w-72 shrink-0 flex-col gap-2 rounded-xl border p-3",
        isOver && isDropTarget && "ring-primary ring-2",
        tone === "hired" && "border-success/40",
        tone === "rejected" && "border-destructive/40"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <div className="flex min-h-16 flex-col gap-2">{children}</div>
    </div>
  );
}

export function PipelineBoard({ projectId }: { projectId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: project } = useProject(projectId);
  const { data: board, isLoading, isError } = usePipelineBoard(projectId);
  const move = useMovePipelineCard(projectId);

  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [detailMatchId, setDetailMatchId] = useState<number | null>(null);
  const [terminal, setTerminal] = useState<{
    card: PipelineCardDTO;
    kind: "hired" | "rejected";
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const cards = board?.cards ?? [];
  const stages: PipelineStageDTO[] = board?.stages ?? [];

  // Colunas: etapas ATIVAS na ordem + qualquer etapa arquivada que ainda tenha card parado nela
  // (essa não é destino de drop). Depois, "Contratado" e "Reprovado" fixas.
  const stageColumns = stages
    .filter(
      (s) =>
        s.active ||
        cards.some(
          (c) => c.column.kind === "STAGE" && c.column.stageId === s.id
        )
    )
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const cardsFor = (key: string) => cards.filter((c) => columnKeyOf(c) === key);

  const invalidateBoard = () =>
    queryClient.invalidateQueries({ queryKey: pipelineBoardKey(projectId) });

  function onDragStart(event: DragStartEvent) {
    setActiveCardId(Number(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    const { active, over } = event;
    if (!over) return;

    const matchId = Number(active.id);
    const card = cards.find((c) => c.matchId === matchId);
    if (!card || !card.draggable) return;

    const from = columnKeyOf(card);
    const to = String(over.id);
    if (to === from) return;

    if (to === HIRED) {
      // Não chama o endpoint de stage -- é a ação real de aceitar o interesse.
      if (card.status === "PROFESSIONAL_INTERESTED") {
        setTerminal({ card, kind: "hired" });
      } else {
        toast.info(
          "O profissional ainda não aceitou o convite — não dá pra marcar como contratado por aqui."
        );
      }
      return;
    }

    if (to === REJECTED) {
      setTerminal({ card, kind: "rejected" });
      return;
    }

    const stageId = Number(to);
    if (Number.isNaN(stageId)) return;
    move.mutate({ matchId, stageId }); // otimista (ver useMovePipelineCard)
  }

  const activeCard = cards.find((c) => c.matchId === activeCardId) ?? null;
  // Re-derivado do board a cada render -> os números do topo do painel ficam frescos após um save.
  const detailCard =
    detailMatchId != null
      ? (cards.find((c) => c.matchId === detailMatchId) ?? null)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-primary text-xs font-bold tracking-widest uppercase">
              Pipeline de contratação
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              {project?.title ?? "Vaga"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/company/projects/${projectId}/ranking`}>
                <ListOrdered className="size-4" />
                Ver ranking
              </Link>
            </Button>
            <PipelineStageManager projectId={projectId} />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72 shrink-0" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={ListOrdered}
          title="Não foi possível carregar o pipeline"
          description="Tente recarregar a página."
        />
      )}

      {board && (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveCardId(null)}
        >
          <div className="flex gap-3 overflow-x-auto pb-4">
            {stageColumns.map((stage) => {
              const columnCards = cardsFor(String(stage.id));
              return (
                <Column
                  key={stage.id}
                  id={String(stage.id)}
                  title={
                    stage.active ? stage.name : `${stage.name} (arquivada)`
                  }
                  count={columnCards.length}
                  isDropTarget={stage.active}
                >
                  {columnCards.length === 0 ? (
                    <p className="text-muted-foreground/60 px-1 py-6 text-center text-xs">
                      {stage.active ? "Arraste candidatos para cá" : "—"}
                    </p>
                  ) : (
                    columnCards.map((card) => (
                      <DraggableCard
                        key={card.matchId}
                        card={card}
                        onOpen={() => setDetailMatchId(card.matchId)}
                      />
                    ))
                  )}
                </Column>
              );
            })}

            {[
              { id: HIRED, title: "Contratado", tone: "hired" as const },
              { id: REJECTED, title: "Reprovado", tone: "rejected" as const },
            ].map((col) => {
              const columnCards = cardsFor(col.id);
              return (
                <Column
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  count={columnCards.length}
                  tone={col.tone}
                  isDropTarget
                >
                  {columnCards.length === 0 ? (
                    <p className="text-muted-foreground/60 px-1 py-6 text-center text-xs">
                      Solte um card aqui para{" "}
                      {col.id === HIRED ? "contratar" : "reprovar"}
                    </p>
                  ) : (
                    columnCards.map((card) => (
                      // Cards terminais são fixos (card.draggable === false) mas ainda abrem o
                      // painel de detalhe (notas + scorecard continuam úteis depois de contratar/reprovar).
                      <PipelineCard
                        key={card.matchId}
                        card={card}
                        onOpen={() => setDetailMatchId(card.matchId)}
                      />
                    ))
                  )}
                </Column>
              );
            })}
          </div>

          <DragOverlay>
            {activeCard ? <PipelineCard card={activeCard} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {detailCard && (
        <CandidateDetailDialog
          key={detailCard.matchId}
          projectId={projectId}
          card={detailCard}
          open
          onOpenChange={(o) => {
            if (!o) setDetailMatchId(null);
          }}
        />
      )}

      {terminal?.kind === "rejected" && (
        <RejectInterestDialog
          key={`reject-${terminal.card.matchId}`}
          matchId={terminal.card.matchId}
          open
          hideTrigger
          onOpenChange={(o) => {
            if (!o) setTerminal(null);
          }}
          onRejected={() => {
            setTerminal(null);
            invalidateBoard();
          }}
        />
      )}

      {terminal?.kind === "hired" && (
        <ConfirmHireDialog
          key={`hire-${terminal.card.matchId}`}
          matchId={terminal.card.matchId}
          professionalName={terminal.card.professional.name}
          open
          onOpenChange={(o) => {
            if (!o) setTerminal(null);
          }}
          onHired={() => {
            setTerminal(null);
            invalidateBoard();
          }}
        />
      )}
    </div>
  );
}
