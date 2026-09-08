"use client";

import { InternalVisibilityBadge } from "@/components/company/pipeline/internal-visibility-badge";
import { NotesSection } from "@/components/company/pipeline/notes-section";
import { ScorecardSection } from "@/components/company/pipeline/scorecard-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { PipelineCardDTO } from "@/types/pipeline";

/** Dois números distintos, dois rótulos -- nunca somados nem misturados (item 3 do prompt). */
function ScoreTile({
  label,
  hint,
  value,
}: {
  label: string;
  hint: string;
  value: string;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </div>
      <div className="mt-0.5 text-xl font-bold tabular-nums">{value}</div>
      <div className="text-muted-foreground text-xs">{hint}</div>
    </div>
  );
}

/**
 * Painel de detalhe interno de um candidato no board. Abre ao clicar num card. Reúne as notas
 * internas e o scorecard da equipe -- ambos COMPANY-only (banner de aviso no topo).
 */
export function CandidateDetailDialog({
  projectId,
  card,
  open,
  onOpenChange,
}: {
  projectId: number;
  card: PipelineCardDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { professional, evaluation } = card;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="thin-scrollbar max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0">
              <AvatarImage
                src={professional.profilePhotoUrl ?? undefined}
                alt=""
              />
              <AvatarFallback>
                {professional.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{professional.name}</DialogTitle>
              <DialogDescription>
                Detalhe interno do candidato nesta vaga.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <InternalVisibilityBadge />

        <div className="grid grid-cols-2 gap-3">
          <ScoreTile
            label="Score do sistema"
            hint="Compatibilidade calculada pelo algoritmo (0–100)"
            value={
              card.matchScore != null ? `${Math.round(card.matchScore)}%` : "—"
            }
          />
          <ScoreTile
            label="Avaliação da equipe"
            hint={`${evaluation.count} parecer(es) · escala 1–5`}
            value={
              evaluation.average != null
                ? `${evaluation.average.toFixed(1)} / 5`
                : "—"
            }
          />
        </div>

        <Separator />
        <NotesSection professionalId={professional.id} matchId={card.matchId} />

        <Separator />
        <ScorecardSection projectId={projectId} matchId={card.matchId} />
      </DialogContent>
    </Dialog>
  );
}
