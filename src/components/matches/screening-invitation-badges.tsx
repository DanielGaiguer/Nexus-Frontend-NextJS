import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { screeningInvitationStatusLabels } from "@/types/screening";
import type { ScreeningInvitationSummaryDTO } from "@/types/screening";

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  SENT: "outline",
  IN_PROGRESS: "outline",
  SUBMITTED: "secondary",
  APPROVED: "default",
  REPROVED: "destructive",
  DECLINED: "destructive",
  EXPIRED: "destructive",
  // Encerrado pelo match/projeto, não por recusa ou prazo -- neutro, não "destructive".
  CANCELLED: "outline",
};

/**
 * Selo compacto do processo seletivo em etapas -- mostra só a tentativa mais recente (a lista já
 * vem ordenada por sentAt decrescente, ver ScreeningInvitationService.getSummariesFor), com
 * "Etapa X de N" pra dar contexto de progresso sem precisar listar o histórico inteiro no card.
 * Reaproveitado em CandidateCard (empresa), MatchCard (profissional), MatchCompareDialog e no
 * card de Proposta, junto com score/reputação já exibidos ali. Linka pra tela de decisão
 * (empresa) ou de resposta/resultado (profissional), dependendo de `viewer` e do status.
 */
export function ScreeningInvitationBadges({
  screeningInvitations,
  viewer,
}: {
  screeningInvitations: ScreeningInvitationSummaryDTO[];
  viewer: "company" | "professional";
}) {
  if (screeningInvitations.length === 0) return null;
  const latest = screeningInvitations[0];

  const isPending = latest.status === "SENT" || latest.status === "IN_PROGRESS";
  const href =
    viewer === "company"
      ? `/company/screening-invitations/${latest.id}`
      : isPending
        ? `/pro/screening-invitations/${latest.id}/take`
        : `/pro/screening-invitations/${latest.id}`;

  return (
    <Link href={href}>
      <Badge
        variant={statusVariant[latest.status] ?? "outline"}
        className="cursor-pointer"
      >
        <FileQuestion className="size-3" />
        Etapa {latest.stageOrderIndex}/{latest.totalStages}:{" "}
        {screeningInvitationStatusLabels[latest.status]}
        {latest.autoScorePercent != null &&
          ` (${Math.round(latest.autoScorePercent)}%)`}
      </Badge>
    </Link>
  );
}
