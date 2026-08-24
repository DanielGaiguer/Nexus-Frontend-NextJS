import {
  Briefcase,
  Clock,
  DollarSign,
  Star,
  Users,
  Wrench,
} from "lucide-react";

import { AcceptProposalDialog } from "@/components/company/accept-proposal-dialog";
import { RejectProposalDialog } from "@/components/company/reject-proposal-dialog";
import { ProposalDetails } from "@/components/matches/proposal-details";
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

/** Card de comparação de uma proposta recebida -- lista de company/projects/[id]/proposals. */
export function ProposalCard({ proposal }: { proposal: ProposalResponseDTO }) {
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
              <div className="font-semibold">{proposal.professionalName}</div>
              <Badge
                variant={statusBadgeVariant[proposal.status]}
                className="mt-1 w-fit"
              >
                {statusLabel}
              </Badge>
            </div>

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

          <ScoreRing score={proposal.matchScoreAtSubmission} size={84} />
        </div>
      </CardContent>
      <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Ver proposta completa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
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
      </div>
    </Card>
  );
}
