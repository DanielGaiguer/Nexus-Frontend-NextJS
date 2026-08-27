import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ScreeningInvitationDetailDTO } from "@/types/screening";

export interface StageFlowNode {
  id: string | number;
  title: string;
  state: "completed" | "current" | "failed" | "upcoming";
}

const TERMINAL_NEGATIVE = new Set([
  "REPROVED",
  "DECLINED",
  "EXPIRED",
  "CANCELLED",
]);

const startNodeLabel: Record<string, string> = {
  MATCH_INTEREST: "Interesse enviado",
  MATCH_ACCEPT: "Convite aceito",
  PROPOSAL_SUBMIT: "Proposta enviada",
};

/** Monta os nós do fluxo a partir do processo inteiro (uma ScreeningInvitationDetailDTO por etapa
 * já alcançada, ver ScreeningInvitationService.getProcessDetail) -- bolinha inicial é a ação que
 * disparou a triagem (interesse/aceite/proposta), bolinha final é o resultado (match bem-sucedido
 * só quando TODAS as etapas foram aprovadas; falho se alguma foi reprovada/recusada/expirada/
 * cancelada; senão ainda em andamento). */
export function buildProcessFlowNodes(
  process: ScreeningInvitationDetailDTO[]
): StageFlowNode[] {
  if (process.length === 0) return [];

  const startLabel =
    startNodeLabel[process[0].pendingIntentType ?? ""] ?? "Interesse enviado";

  const stageNodes: StageFlowNode[] = process.map((invitation) => ({
    id: invitation.screeningStageId,
    title: invitation.stageTitle,
    state:
      invitation.status === "APPROVED"
        ? "completed"
        : TERMINAL_NEGATIVE.has(invitation.status)
          ? "failed"
          : "current",
  }));

  const hasFailed = stageNodes.some((node) => node.state === "failed");
  const allApproved =
    process.length === process[0].totalStages &&
    process.every((invitation) => invitation.status === "APPROVED");

  const endState: StageFlowNode["state"] = hasFailed
    ? "failed"
    : allApproved
      ? "completed"
      : "upcoming";

  return [
    { id: "start", title: startLabel, state: "completed" },
    ...stageNodes,
    { id: "end", title: "Match bem-sucedido", state: endState },
  ];
}

/** Fluxo horizontal com só o título de cada nó -- usado na tela de detalhe do processo seletivo
 * pra dar contexto do processo inteiro (do interesse/proposta inicial até o match), não só das
 * etapas de triagem. Quem monta a lista de nós decide o que é "bolinha inicial"/"bolinha final"
 * e o estado de cada etapa -- este componente só desenha. */
export function ScreeningStageFlow({ nodes }: { nodes: StageFlowNode[] }) {
  return (
    <div className="flex flex-wrap items-start">
      {nodes.map((node, index) => {
        const isCompleted = node.state === "completed";
        const isCurrent = node.state === "current";
        const isFailed = node.state === "failed";

        return (
          <div key={node.id} className="flex items-start">
            <div className="flex w-20 flex-col items-center gap-1.5 sm:w-28">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  isCurrent &&
                    "border-primary bg-primary text-primary-foreground",
                  isCompleted && "border-success bg-success/15 text-success",
                  isFailed &&
                    "border-destructive bg-destructive/15 text-destructive",
                  !isCurrent &&
                    !isCompleted &&
                    !isFailed &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : isFailed ? (
                  <X className="size-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-center text-xs leading-tight",
                  isCurrent
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {node.title}
              </span>
            </div>
            {index < nodes.length - 1 && (
              <div
                className={cn(
                  "mt-4 h-0.5 w-6 shrink-0 sm:w-10",
                  isCompleted ? "bg-success/40" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
