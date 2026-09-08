"use client";

import { GripVertical, Star } from "lucide-react";

import { ScreeningInvitationBadges } from "@/components/matches/screening-invitation-badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PipelineCardDTO } from "@/types/pipeline";

/**
 * Card compacto do Kanban. Mostra nome, matchScore (algorítmico) e, separado, o scorecard humano
 * (★ média / nº de pareceres) -- os dois números nunca se fundem. Badge de screening quando houver.
 * `dragHandleProps`/`isDragging` vêm de quem envolve o card com useDraggable; cards terminais
 * (Contratado/Reprovado) não recebem nada disso e mostram o sub-rótulo da API.
 *
 * `onOpen` (quando passado) torna o corpo do card clicável -- abre o painel de detalhe interno
 * (notas + scorecard). A alça de arrastar e o selo de screening param a propagação pra não abrir
 * o painel sem querer.
 */
export function PipelineCard({
  card,
  dragHandleProps,
  isDragging,
  isOverlay,
  onOpen,
}: {
  card: PipelineCardDTO;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
  isDragging?: boolean;
  isOverlay?: boolean;
  onOpen?: () => void;
}) {
  const score = card.matchScore != null ? Math.round(card.matchScore) : null;
  const { evaluation, column } = card;

  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
      className={cn(
        "bg-card flex gap-2 rounded-lg border p-3 text-sm shadow-sm",
        onOpen &&
          "hover:border-primary/40 focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:outline-none",
        isDragging && "opacity-40",
        isOverlay && "rotate-1 shadow-lg",
        column.kind !== "STAGE" && "opacity-90"
      )}
    >
      {card.draggable && (
        <button
          type="button"
          aria-label={`Mover ${card.professional.name}`}
          className="text-muted-foreground hover:text-foreground -ml-1 cursor-grab touch-none active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          {...dragHandleProps}
        >
          <GripVertical className="size-4" />
        </button>
      )}

      <Avatar className="size-8 shrink-0">
        <AvatarImage
          src={card.professional.profilePhotoUrl ?? undefined}
          alt=""
        />
        <AvatarFallback>
          {card.professional.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="truncate font-medium">{card.professional.name}</div>

        <div className="flex flex-wrap items-center gap-1.5">
          {score != null && (
            <Badge variant="outline" className="tabular-nums">
              Score {score}%
            </Badge>
          )}
          {evaluation.count > 0 && evaluation.average != null && (
            <Badge
              variant="secondary"
              className="tabular-nums"
              title="Média do scorecard da equipe (1–5)"
            >
              <Star className="fill-warning text-warning size-3" />
              {evaluation.average.toFixed(1)}
              <span className="text-muted-foreground">
                ({evaluation.count})
              </span>
            </Badge>
          )}
        </div>

        {card.latestScreening && (
          <span
            className="inline-block"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <ScreeningInvitationBadges
              screeningInvitations={[card.latestScreening]}
              viewer="company"
            />
          </span>
        )}

        {column.subLabel && (
          <div className="text-muted-foreground text-xs">{column.subLabel}</div>
        )}
      </div>
    </div>
  );
}
