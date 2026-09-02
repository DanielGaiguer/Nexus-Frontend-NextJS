import {
  Briefcase,
  Building2,
  FileQuestion,
  GitCompare,
  Star,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { MatchCompareDialog } from "@/components/company/match-compare-dialog";
import { MatchConfirmationBadge } from "@/components/matches/match-confirmation-badge";
import { ScoreBreakdownGrid } from "@/components/matches/score-breakdown-grid";
import { ScreeningInvitationBadges } from "@/components/matches/screening-invitation-badges";
import { ScoreRing } from "@/components/professional/score-ring";
import {
  RowActions,
  type RowActionItem,
} from "@/components/shared/row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { rejectionReasonLabels } from "@/types/match";
import type { MatchResponseDTO } from "@/types/match";

/** Espelha MatchCard (professional), só que do ponto de vista da empresa — foco no candidato, não na vaga. */
export function CandidateCard({
  match,
  showScore = true,
  showProject = true,
  badge,
  actions,
  primaryActions,
  menuItems,
}: {
  match: MatchResponseDTO;
  showScore?: boolean;
  showProject?: boolean;
  /** Selo de status do match (ex.: "Match Confirmado", aviso de expiração) — vai logo abaixo do nome do candidato. */
  badge?: ReactNode;
  /** Legado: fragmento cru de botões. */
  actions?: ReactNode;
  /** Ações de decisão, sempre visíveis (Aceitar/Recusar/Cancelar…). */
  primaryActions?: ReactNode;
  /** Ações secundárias — vão pro menu "Ações" (Comparar e "Ver processo" são anexados automaticamente). */
  menuItems?: RowActionItem[];
}) {
  const { professional } = match;
  const score = match.scoreBreakdown
    ? Math.round(match.scoreBreakdown.finalScore)
    : null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="size-12 shrink-0">
            <AvatarImage
              src={professional.profilePhotoUrl ?? undefined}
              alt=""
            />
            <AvatarFallback>
              {professional.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <div className="font-semibold">{professional.name}</div>
              {showProject && (
                <div className="mt-1 flex flex-col items-start gap-1">
                  <Badge
                    variant={
                      match.project.opportunityType === "JOB"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {match.project.opportunityType === "JOB" ? (
                      <Building2 className="size-3" />
                    ) : (
                      <Briefcase className="size-3" />
                    )}
                    {match.project.opportunityType === "JOB"
                      ? "Vaga"
                      : "Projeto"}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    {match.project.title}
                  </span>
                </div>
              )}
              {professional.reputation != null && (
                <div className="mt-1 flex items-center gap-1">
                  <Star className="fill-warning text-warning size-3.5" />
                  <span className="text-xs font-medium">
                    {professional.reputation.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {badge}

            <MatchConfirmationBadge confirmation={match.confirmation} />

            <ScreeningInvitationBadges
              screeningInvitations={match.screeningInvitations}
              viewer="company"
            />

            {match.rejectionReasons && match.rejectionReasons.length > 0 && (
              <div>
                <div className="text-muted-foreground mb-1 text-[11px] tracking-wide uppercase">
                  Motivos da rejeição
                </div>
                <div className="flex flex-wrap gap-1">
                  {match.rejectionReasons.map((reason) => (
                    <Badge
                      key={reason}
                      variant="outline"
                      className="text-[11px]"
                    >
                      {rejectionReasonLabels[reason] ?? reason}
                    </Badge>
                  ))}
                </div>
                {match.rejectionDescription && (
                  <p className="text-muted-foreground mt-1 text-xs whitespace-pre-wrap">
                    {match.rejectionDescription}
                  </p>
                )}
              </div>
            )}
          </div>

          {showScore && score != null && <ScoreRing score={score} size={84} />}
        </div>

        {match.scoreBreakdown && (
          <ScoreBreakdownGrid breakdown={match.scoreBreakdown} />
        )}
      </CardContent>
      {primaryActions !== undefined || menuItems !== undefined ? (
        <div className="border-t px-6 py-3">
          <RowActions
            primary={primaryActions}
            items={[
              {
                key: "compare",
                label: "Comparar",
                icon: GitCompare,
                dialog: (p) => (
                  <MatchCompareDialog match={match} hideTrigger {...p} />
                ),
              },
              ...(match.screeningInvitations.length > 0
                ? [
                    {
                      key: "screening",
                      label: "Ver processo",
                      icon: FileQuestion,
                      href: `/company/screening-invitations/${match.screeningInvitations[0].id}`,
                    } satisfies RowActionItem,
                  ]
                : []),
              ...(menuItems ?? []),
            ]}
          />
        </div>
      ) : (
        <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-3">
          <MatchCompareDialog match={match} />
          {match.screeningInvitations.length > 0 && (
            <Button size="sm" variant="outline" asChild>
              <Link
                href={`/company/screening-invitations/${match.screeningInvitations[0].id}`}
              >
                <FileQuestion className="size-4" />
                Ver processo
              </Link>
            </Button>
          )}
          {actions}
        </div>
      )}
    </Card>
  );
}
