"use client";

import { ArrowLeft, CheckCircle2, Clock, Eye, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AcceptProposalDialog } from "@/components/company/accept-proposal-dialog";
import { RejectProposalDialog } from "@/components/company/reject-proposal-dialog";
import {
  buildProcessFlowNodes,
  ScreeningStageFlow,
} from "@/components/matches/screening-stage-flow";
import { ProposalDetails } from "@/components/matches/proposal-details";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveScreeningInvitation,
  useReproveScreeningInvitation,
} from "@/hooks/mutations/useScreeningInvitationMutations";
import { useScreeningProcessDetail } from "@/hooks/queries/useScreeningInvitations";
import { useProposal } from "@/hooks/queries/useProposals";
import { ApiError } from "@/lib/api-client";
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

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m${seconds.toString().padStart(2, "0")}s`;
}

/** Painel separado, sempre visível, com a proposta associada -- aceite/recusa dela é uma decisão
 * independente da empresa, nunca automatizada pelo resultado da etapa (decisão confirmada com o
 * usuário: "deixe isso bem separado"). */
function AssociatedProposalPanel({ proposalId }: { proposalId: number }) {
  const { data: proposal, isLoading } = useProposal(proposalId);

  if (isLoading || !proposal) {
    return <Skeleton className="h-32" />;
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">
            Proposta de {proposal.professionalName}
          </h2>
          <Badge
            variant={proposal.status === "PENDING" ? "secondary" : "outline"}
          >
            {proposal.status === "PENDING"
              ? "Aguardando resposta"
              : proposal.status}
          </Badge>
        </div>
        <ProposalDetails proposal={proposal} />
        {proposal.status === "PENDING" && (
          <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
            <RejectProposalDialog
              proposalId={proposal.id}
              projectId={proposal.projectId}
              professionalName={proposal.professionalName}
            />
            <AcceptProposalDialog
              proposalId={proposal.id}
              projectId={proposal.projectId}
              professionalName={proposal.professionalName}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Uma etapa já alcançada -- mostra as respostas e, se `SUBMITTED`, o comentário + os botões de
 * aprovar/reprovar (cada etapa tem sua própria instância de mutation, escopada ao próprio id). */
function CompanyStageSection({
  invitation,
  index,
}: {
  invitation: ScreeningInvitationDetailDTO;
  index: number;
}) {
  const router = useRouter();
  const approve = useApproveScreeningInvitation(invitation.id);
  const reprove = useReproveScreeningInvitation(invitation.id);
  const [comment, setComment] = useState("");
  const needsDecision = invitation.status === "SUBMITTED";
  const isPending = approve.isPending || reprove.isPending;
  const isLastStage = invitation.stageOrderIndex === invitation.totalStages;

  function handleApprove() {
    approve.mutate(
      { comment: comment.trim() || null },
      {
        onSuccess: () => {
          if (!isLastStage) {
            toast.success("Avanço aprovado!");
            return;
          }
          // Última etapa aprovada -- a ação que ficou pendente (interesse/aceite vira match,
          // proposta continua PENDING) se resolve sozinha no backend, mas quem ainda decide de
          // verdade é a empresa: aceitar o match ou aceitar a proposta são sempre ações
          // independentes dela. Leva direto pra tela onde essa decisão é tomada.
          if (invitation.pendingIntentType === "PROPOSAL_SUBMIT") {
            toast.success(
              "Avanço aprovado! Aceite a proposta do profissional para vocês entrarem em contato!"
            );
            router.push("/company/proposals?tab=received");
          } else {
            toast.success(
              "Avanço aprovado! Aprove o match do profissional para vocês iniciarem contato!"
            );
            router.push("/company/matches");
          }
        },
        onError: (err) =>
          toast.error(
            err instanceof ApiError ? err.message : "Não foi possível aprovar."
          ),
      }
    );
  }

  function handleReprove() {
    reprove.mutate(
      { comment: comment.trim() || null },
      {
        onSuccess: () => toast.success("Etapa reprovada."),
        onError: (err) =>
          toast.error(
            err instanceof ApiError ? err.message : "Não foi possível reprovar."
          ),
      }
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">
            {index + 1}. {invitation.stageTitle}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {invitation.autoScorePercent != null && (
              <span className="text-sm font-medium">
                {Math.round(invitation.autoScorePercent)}% (referência)
              </span>
            )}
            {invitation.totalTimeSpentSeconds != null && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Clock className="size-3" />
                {formatSeconds(invitation.totalTimeSpentSeconds)}
              </span>
            )}
            {invitation.tabSwitchCount != null &&
              invitation.tabSwitchCount > 0 && (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Eye className="size-3" />
                  {invitation.tabSwitchCount} troca(s) de aba
                </span>
              )}
            <Badge variant={statusVariant[invitation.status] ?? "secondary"}>
              {screeningInvitationStatusLabels[invitation.status]}
            </Badge>
          </div>
        </div>

        {(invitation.status === "SENT" ||
          invitation.status === "IN_PROGRESS") && (
          <p className="text-muted-foreground text-sm">
            Ainda aguardando o profissional responder esta etapa.
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

        {needsDecision ? (
          <div className="space-y-3 border-t pt-3">
            <div className="space-y-1">
              <label
                className="text-sm font-medium"
                htmlFor={`decision-comment-${invitation.id}`}
              >
                Comentário (opcional)
              </label>
              <Textarea
                id={`decision-comment-${invitation.id}`}
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Visível pro profissional se você reprovar."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleReprove}
                disabled={isPending}
              >
                Reprovar
              </Button>
              <Button onClick={handleApprove} disabled={isPending}>
                {isPending ? "Salvando…" : "Aprovar avanço"}
              </Button>
            </div>
          </div>
        ) : (
          invitation.companyDecisionComment && (
            <div className="bg-muted/40 rounded-md border p-3 text-sm">
              <p className="font-medium">Seu comentário</p>
              <p className="text-muted-foreground mt-1">
                {invitation.companyDecisionComment}
              </p>
            </div>
          )
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
          Ainda não chegou nesta etapa
        </Badge>
      </CardContent>
    </Card>
  );
}

export default function ScreeningInvitationDecisionPage() {
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
          {first.professionalName}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {first.projectTitle}
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto">
          <ScreeningStageFlow nodes={nodes} />
        </CardContent>
      </Card>

      {first.pendingIntentType === "PROPOSAL_SUBMIT" &&
        first.pendingProposalId != null && (
          <AssociatedProposalPanel proposalId={first.pendingProposalId} />
        )}

      <div className="flex flex-col gap-3">
        {first.stages.map((stage, index) => {
          const invitation = process.find(
            (inv) => inv.screeningStageId === stage.stageId
          );
          return invitation ? (
            <CompanyStageSection
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
