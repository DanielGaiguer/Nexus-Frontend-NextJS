import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Aviso INEQUÍVOCO de que o conteúdo é interno da conta empresarial. Não é cosmético: notas
 * internas e scorecard nunca são compartilhados com o candidato (ver
 * CompanyCandidateNoteService / CandidateEvaluationService no backend). Fica no topo do painel
 * de detalhe.
 */
export function InternalVisibilityBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-warning/40 bg-warning/10 text-warning flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium",
        className
      )}
    >
      <Lock className="size-4 shrink-0" />
      <span>
        Visível só para a sua equipe. O candidato nunca vê notas internas nem o
        scorecard.
      </span>
    </div>
  );
}
