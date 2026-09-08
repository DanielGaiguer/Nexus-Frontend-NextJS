"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, RotateCcw, Settings2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useReplacePipelineStages } from "@/hooks/mutations/usePipelineActions";
import { usePipelineStages } from "@/hooks/queries/usePipelineBoard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { PipelineStageDTO } from "@/types/pipeline";

type Row = { key: string; id: number | null; name: string };

function toRows(stages: PipelineStageDTO[]): Row[] {
  return stages
    .filter((s) => s.active)
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((s) => ({ key: String(s.id), id: s.id, name: s.name }));
}

function SortableRow({
  row,
  onName,
  onRemove,
}: {
  row: Row;
  onName: (name: string) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.key });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "bg-background flex items-center gap-2 rounded-md border p-2",
        isDragging && "opacity-50"
      )}
    >
      <button
        type="button"
        aria-label="Reordenar etapa"
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <Input
        value={row.name}
        onChange={(e) => onName(e.target.value)}
        placeholder="Nome da etapa"
        aria-label="Nome da etapa"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Remover etapa"
        onClick={onRemove}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

/**
 * Painel lateral de gestão das colunas intermediárias do board: adicionar / renomear / reordenar
 * (drag) / desativar (remover da lista -- o backend arquiva quem tem card e apaga quem nunca foi
 * usado). Reativar traz uma arquivada de volta pra lista. Salvar chama o PUT .../pipeline/stages
 * (replace da lista inteira, molde do mergeStages). "Contratado"/"Reprovado" não são etapas.
 *
 * `rows` começa null e só é materializado no primeiro edit -- até lá a lista renderizada é
 * derivada de `stages` em tempo de render (sem useEffect, ver "You Might Not Need an Effect").
 * Ao fechar o painel, `rows` volta a null (reset por ação do usuário).
 */
export function PipelineStageManager({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const { data: stages } = usePipelineStages(projectId, open);
  const replaceStages = useReplacePipelineStages(projectId);
  const [rows, setRows] = useState<Row[] | null>(null);

  const workingRows: Row[] | null = rows ?? (stages ? toRows(stages) : null);

  function mutateRows(fn: (current: Row[]) => Row[]) {
    setRows((current) => fn(current ?? toRows(stages ?? [])));
  }

  function handleOpenChange(next: boolean) {
    if (!next) setRows(null);
    setOpen(next);
  }

  const archived = (stages ?? []).filter(
    (s) => !s.active && !workingRows?.some((r) => r.id === s.id)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !workingRows) return;
    const from = workingRows.findIndex((r) => r.key === active.id);
    const to = workingRows.findIndex((r) => r.key === over.id);
    if (from === -1 || to === -1) return;
    mutateRows((current) => arrayMove(current, from, to));
  }

  function save() {
    const list = workingRows;
    if (!list) return;
    if (list.length === 0) {
      toast.error("O pipeline precisa de ao menos uma etapa.");
      return;
    }
    if (list.some((r) => r.name.trim() === "")) {
      toast.error("Toda etapa precisa de um nome.");
      return;
    }
    replaceStages.mutate(
      { stages: list.map((r) => ({ id: r.id, name: r.name.trim() })) },
      {
        onSuccess: () => {
          toast.success("Etapas atualizadas.");
          handleOpenChange(false);
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível salvar as etapas."
          );
        },
      }
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="size-4" />
          Gerenciar etapas
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Etapas do pipeline</SheetTitle>
          <SheetDescription>
            Colunas intermediárias desta vaga. &quot;Contratado&quot; e
            &quot;Reprovado&quot; são fixas e não entram aqui.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {workingRows === null ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={workingRows.map((r) => r.key)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {workingRows.map((row, index) => (
                      <SortableRow
                        key={row.key}
                        row={row}
                        onName={(name) =>
                          mutateRows((current) =>
                            current.map((r, i) =>
                              i === index ? { ...r, name } : r
                            )
                          )
                        }
                        onRemove={() =>
                          mutateRows((current) =>
                            current.filter((_, i) => i !== index)
                          )
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() =>
                  mutateRows((current) => [
                    ...current,
                    { key: crypto.randomUUID(), id: null, name: "" },
                  ])
                }
              >
                <Plus className="size-4" />
                Adicionar etapa
              </Button>

              {archived.length > 0 && (
                <div className="mt-2 space-y-2 border-t pt-3">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Arquivadas
                  </p>
                  {archived.map((stage) => (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-muted-foreground truncate">
                        {stage.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          mutateRows((current) => [
                            ...current,
                            {
                              key: String(stage.id),
                              id: stage.id,
                              name: stage.name,
                            },
                          ])
                        }
                      >
                        <RotateCcw className="size-3.5" />
                        Reativar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter>
          <Badge variant="secondary" className="mr-auto self-center">
            {workingRows?.length ?? 0} etapa(s)
          </Badge>
          <SheetClose asChild>
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </SheetClose>
          <Button
            type="button"
            onClick={save}
            disabled={replaceStages.isPending || workingRows === null}
          >
            {replaceStages.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
