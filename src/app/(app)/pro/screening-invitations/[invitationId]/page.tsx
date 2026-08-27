"use client";

import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import {
  buildProcessFlowNodes,
  ScreeningStageFlow,
} from "@/components/matches/screening-stage-flow";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useScreeningProcessDetail } from "@/hooks/queries/useScreeningInvitations";
import {
  screeningInvitationStatusLabels,
  type ScreeningInvitationDetailDTO,
  type ScreeningStageStatusDTO,
} from "@/types/screening";

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  SENT: "secondary",
  IN_PROGRESS: "secondary",
  SUBMITTED: "secondary",
  APPROVED: "default",
  REPROVED: "destructive",
  DECLINED: "destructive",
  EXPIRED: "destructive",
  CANCELLED: "secondary",
};

/** Uma etapa já alcançada -- mostra as respostas e, se reprovada, o comentário da empresa. */
function ReachedStageCard({
  invitation,
  index,
}: {
  invitation: ScreeningInvitationDetailDTO;
  index: number;
}) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">
            {index + 1}. {invitation.stageTitle}
          </p>
          <Badge variant={statusVariant[invitation.status] ?? "secondary"}>
            {screeningInvitationStatusLabels[invitation.status]}
          </Badge>
        </div>

        {(invitation.status === "SENT" ||
          invitation.status === "IN_PROGRESS") && (
          <p className="text-muted-foreground text-sm">
            Você ainda não respondeu esta etapa.
          </p>
        )}

        {invitation.status === "SUBMITTED" && (
          <p className="text-muted-foreground text-sm">
            Sua resposta foi enviada — aguardando a decisão da empresa sobre
            esta etapa.
          </p>
        )}

        {invitation.answers.length > 0 && (
          <div className="flex flex-col gap-2 border-t pt-3">
            {invitation.answers.map((answer, answerIndex) => (
              <div key={answer.answerId} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {answerIndex + 1}. {answer.prompt}
                  </p>
                  {answer.type === "MULTIPLE_CHOICE" &&
                    answer.correct != null &&
                    (answer.correct ? (
                      <CheckCircle2 className="text-success size-4 shrink-0" />
                    ) : (
                      <XCircle className="text-destructive size-4 shrink-0" />
                    ))}
                </div>
                {answer.type === "MULTIPLE_CHOICE" ? (
                  <ul className="space-y-1 text-sm">
                    {answer.options.map((option, optionIndex) => (
                      <li
                        key={optionIndex}
                        className={
                          optionIndex === answer.selectedOptionIndex
                            ? "font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {optionIndex === answer.selectedOptionIndex
                          ? "→ "
                          : "   "}
                        {option}
                        {optionIndex === answer.correctOptionIndex &&
                          " (correta)"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {answer.essayText}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {invitation.status === "REPROVED" &&
          invitation.companyDecisionComment && (
            <div className="bg-muted/40 rounded-md border p-3 text-sm">
              <p className="font-medium">Comentário da empresa</p>
              <p className="text-muted-foreground mt-1">
                {invitation.companyDecisionComment}
              </p>
            </div>
          )}

        {invitation.status === "EXPIRED" && (
          <p className="text-muted-foreground text-sm">
            Você não respondeu a tempo. Diferente de recusar, esse prazo é
            definitivo — não é possível tentar novamente para esta vaga.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function NotReachedStageCard({
  stage,
  index,
}: {
  stage: ScreeningStageStatusDTO;
  index: number;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm font-medium">
          {index + 1}. {stage.title}
        </p>
        <Badge variant="outline" className="text-muted-foreground">
          <Clock className="size-3" />
          Aguardando etapas anteriores
        </Badge>
      </CardContent>
    </Card>
  );
}

export default function ScreeningInvitationResultPage() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const id = Number(invitationId);
  const router = useRouter();

  const { data: process, isLoading, error } = useScreeningProcessDetail(id);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !process || process.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={XCircle}
          title="Processo não encontrado"
          description="Este convite não existe ou você não tem acesso a ele."
        />
      </div>
    );
  }

  const first = process[0];
  const nodes = buildProcessFlowNodes(process);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>
        <p className="text-primary text-xs font-bold tracking-widest uppercase">
          {first.screeningQuestionnaireTitle}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {first.projectTitle}
        </h1>
      </div>

      <Card>
        <CardContent className="overflow-x-auto">
          <ScreeningStageFlow nodes={nodes} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {first.stages.map((stage, index) => {
          const invitation = process.find(
            (inv) => inv.screeningStageId === stage.stageId
          );
          return invitation ? (
            <ReachedStageCard
              key={stage.stageId}
              invitation={invitation}
              index={index}
            />
          ) : (
            <NotReachedStageCard
              key={stage.stageId}
              stage={stage}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}
