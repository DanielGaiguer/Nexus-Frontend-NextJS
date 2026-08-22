import { Briefcase, Building2, Star } from "lucide-react";
import type { ReactNode } from "react";

import { ScoreRing } from "@/components/professional/score-ring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { rejectionReasonLabels } from "@/types/match";
import type { MatchResponseDTO } from "@/types/match";

const breakdownLabels = {
  skills: "Skills",
  budget: "Orçamento",
  history: "Histórico",
  reputation: "Reputação",
} as const;

/** Espelha MatchCard (professional), só que do ponto de vista da empresa — foco no candidato, não na vaga. */
export function CandidateCard({
  match,
  showScore = true,
  showProject = true,
  badge,
  actions,
}: {
  match: MatchResponseDTO;
  showScore?: boolean;
  showProject?: boolean;
  /** Selo de status do match (ex.: "Match Confirmado", aviso de expiração) — vai logo abaixo do nome do candidato. */
  badge?: ReactNode;
  actions?: ReactNode;
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
                <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
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
                  <span>{match.project.title}</span>
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

            {professional.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {professional.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-[11px]">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

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
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3 sm:grid-cols-4">
            {(
              Object.keys(breakdownLabels) as (keyof typeof breakdownLabels)[]
            ).map((key) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {breakdownLabels[key]}
                  </span>
                  <span className="text-primary tabular-nums">
                    {Math.round(match.scoreBreakdown?.[key] ?? 0)}
                  </span>
                </div>
                <Progress
                  value={match.scoreBreakdown?.[key] ?? 0}
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {actions && (
        <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-3">
          {actions}
        </div>
      )}
    </Card>
  );
}
