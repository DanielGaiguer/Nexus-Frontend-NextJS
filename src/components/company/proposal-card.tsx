import {
  Briefcase,
  Clock,
  DollarSign,
  Eye,
  FileQuestion,
  FolderOpen,
  Star,
  User,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AcceptProposalDialog } from "@/components/company/accept-proposal-dialog";
import { MatchCompareDialog } from "@/components/company/match-compare-dialog";
import { RejectProposalDialog } from "@/components/company/reject-proposal-dialog";
import { ProposalDetails } from "@/components/matches/proposal-details";
import { ScoreBreakdownGrid } from "@/components/matches/score-breakdown-grid";
import { ScreeningInvitationBadges } from "@/components/matches/screening-invitation-badges";
import { ScoreRing } from "@/components/professional/score-ring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MatchResponseDTO } from "@/types/match";
import {
  proposalStatusLabels,
  type ProposalResponseDTO,
} from "@/types/proposal";

const statusBadgeVariant: Record<
  ProposalResponseDTO["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "secondary",
  ACCEPTED: "default",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
  EXPIRED: "outline",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/** Card de comparação de uma proposta recebida -- lista de company/projects/[id]/proposals
 * (`showProjectTitle` fica de fora ali, já que o projeto é o contexto da própria tela) e da
 * visão geral em company/proposals (com `showProjectTitle`, já que ali cruza vários projetos).
 * `match` é o Match por trás da proposta (achado via proposal.matchId na tela que lista) --
 * pode não existir ainda em teoria, então os botões que dependem dele somem com segurança.
 * `extraActions` entra depois dos botões padrão -- usado pela visão geral pra anexar
 * chat/contato/avaliação quando a proposta já foi aceita. */
export function ProposalCard({
  proposal,
  match,
  showProjectTitle = false,
  extraActions,
}: {
  proposal: ProposalResponseDTO;
  match?: MatchResponseDTO;
  showProjectTitle?: boolean;
  extraActions?: ReactNode;
}) {
  const statusLabel = proposal.autoRejectedPositionFilled
    ? "Vaga preenchida"
    : proposalStatusLabels[proposal.status];

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="size-12 shrink-0">
            <AvatarImage
              src={proposal.professionalProfilePhotoUrl ?? undefined}
              alt=""
            />
            <AvatarFallback>
              {proposal.professionalName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              {showProjectTitle && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <FolderOpen className="size-3" />
                  {proposal.projectTitle}
                </div>
              )}
              <div className="font-semibold">{proposal.professionalName}</div>
              <Badge
                variant={statusBadgeVariant[proposal.status]}
                className="mt-1 w-fit"
              >
                {statusLabel}
              </Badge>
            </div>

            <ScreeningInvitationBadges
              screeningInvitations={proposal.screeningInvitations}
              viewer="company"
            />

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
              <span className="flex items-center gap-1.5">
                <DollarSign className="text-muted-foreground size-3.5" />
                {formatCurrency(proposal.proposedValue)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="text-muted-foreground size-3.5" />
                {proposal.estimatedDays} dias
              </span>
              {proposal.reputationScore != null && (
                <span className="flex items-center gap-1.5">
                  <Star className="fill-warning text-warning size-3.5" />
                  {proposal.reputationScore.toFixed(1)}/5
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Briefcase className="text-muted-foreground size-3.5" />
                {proposal.previousProjectsCount} projeto(s) anterior(es)
              </span>
              <span className="flex items-center gap-1.5">
                <Wrench className="text-muted-foreground size-3.5" />
                {proposal.matchingSkills.length}/
                {proposal.matchingSkills.length + proposal.missingSkills.length}{" "}
                skills
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="text-muted-foreground size-3.5" />
                {proposal.totalReviews} avaliação(ões)
              </span>
            </div>
          </div>

          <ScoreRing
            score={Math.round(proposal.matchScoreAtSubmission)}
            size={84}
          />
        </div>

        <ScoreBreakdownGrid breakdown={proposal.scoreBreakdown} />
      </CardContent>
      <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/public/opportunity/${proposal.projectId}`}>
            <Eye className="size-4" />
            Ver oportunidade
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={
              match?.status === "MATCHED"
                ? `/company/professionals/${proposal.professionalId}`
                : `/public/professional/${proposal.professionalId}`
            }
          >
            <User className="size-4" />
            Ver profissional
          </Link>
        </Button>
        {match && <MatchCompareDialog match={match} viewer="company" />}
        {proposal.screeningInvitations.length > 0 && (
          <Button size="sm" variant="outline" asChild>
            <Link
              href={`/company/screening-invitations/${proposal.screeningInvitations[0].id}`}
            >
              <FileQuestion className="size-4" />
              Ver processo
            </Link>
          </Button>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Ver proposta completa
            </Button>
          </DialogTrigger>
          <DialogContent className="thin-scrollbar max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Proposta de {proposal.professionalName}</DialogTitle>
            </DialogHeader>
            <ProposalDetails proposal={proposal} />
          </DialogContent>
        </Dialog>
        {proposal.status === "PENDING" && (
          <>
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
          </>
        )}
        {extraActions}
      </div>
    </Card>
  );
}
