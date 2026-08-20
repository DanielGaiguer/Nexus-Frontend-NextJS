"use client";

import { ArrowLeft, Check, Star, X } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";

import { ScoreRing } from "@/components/professional/score-ring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompareCandidates } from "@/hooks/mutations/useCompareCandidates";
import { ApiError } from "@/lib/api-client";

export default function ComparisonPage() {
  return (
    <Suspense fallback={null}>
      <ComparisonContent />
    </Suspense>
  );
}

function ComparisonContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const matchIds = (searchParams.get("matchIds") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => !Number.isNaN(n));

  const compare = useCompareCandidates();
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current || matchIds.length === 0) return;
    requestedRef.current = true;
    compare.mutate(
      { projectId: Number(projectId), matchIds },
      {
        onError: (error) => {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível comparar os candidatos."
          );
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só dispara uma vez, na montagem
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Link
        href={`/company/projects/${projectId}/ranking`}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Voltar para o ranking
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Comparar candidatos
        </h1>
        {compare.data && (
          <p className="text-muted-foreground text-sm">
            {compare.data.projectTitle}
          </p>
        )}
      </div>

      {compare.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: matchIds.length || 2 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      )}

      {compare.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {compare.data.candidates.map((candidate) => (
            <Card key={candidate.matchId}>
              <CardHeader className="items-center text-center">
                <Avatar className="size-16">
                  <AvatarImage
                    src={candidate.profilePhotoUrl ?? undefined}
                    alt=""
                  />
                  <AvatarFallback>
                    {candidate.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-base">{candidate.name}</CardTitle>
                {candidate.city && (
                  <p className="text-muted-foreground text-xs">
                    {candidate.city}
                    {candidate.state ? `, ${candidate.state}` : ""}
                  </p>
                )}
                {candidate.scoreBreakdown && (
                  <ScoreRing
                    score={Math.round(candidate.scoreBreakdown.finalScore)}
                    size={72}
                  />
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reputação</span>
                  {candidate.reputation != null ? (
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="fill-warning text-warning size-3.5" />
                      {candidate.reputation.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Sem avaliações
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Disponibilidade</span>
                  {candidate.available ? (
                    <Check className="text-success size-4" />
                  ) : (
                    <X className="text-destructive size-4" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Projetos anteriores
                  </span>
                  <span className="font-medium">
                    {candidate.previousProjectsCount ?? 0}
                  </span>
                </div>
                {(candidate.minimumSalary != null ||
                  candidate.maximumSalary != null) && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pretensão</span>
                    <span className="font-medium tabular-nums">
                      {candidate.minimumSalary?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      }) ?? "—"}
                      {" – "}
                      {candidate.maximumSalary?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      }) ?? "—"}
                    </span>
                  </div>
                )}

                {candidate.matchingSkills.length > 0 && (
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs uppercase">
                      Skills compatíveis
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {candidate.matchingSkills.map((skill) => (
                        <Badge key={skill} className="text-[11px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.missingSkills.length > 0 && (
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs uppercase">
                      Skills faltando
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {candidate.missingSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-[11px]"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
