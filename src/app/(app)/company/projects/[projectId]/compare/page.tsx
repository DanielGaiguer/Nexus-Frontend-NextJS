"use client";

import { ArrowLeft, Check, Trophy, User, X } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompareCandidates } from "@/hooks/mutations/useCompareCandidates";
import { ApiError } from "@/lib/api-client";
import type { CandidateComparisonItemDTO } from "@/types/comparison";
import type { ScoreBreakdownDTO } from "@/types/match";

const experienceLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

const matchStatusLabels: Record<string, string> = {
  WAITING: "Aguardando",
  COMPANY_INTERESTED: "Empresa interessada",
  PROFESSIONAL_INTERESTED: "Profissional interessado",
  MATCHED: "Match confirmado",
  REJECTED: "Recusado",
};

function money(value: number | null) {
  return value != null
    ? value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      })
    : "—";
}

const breakdownRows: {
  key: keyof ScoreBreakdownDTO;
  label: string;
}[] = [
  { key: "skills", label: "Skills" },
  { key: "budget", label: "Orçamento" },
  { key: "history", label: "Histórico" },
  { key: "reputation", label: "Reputação" },
  { key: "availability", label: "Disponibilidade" },
  { key: "distance", label: "Distância" },
  { key: "experience", label: "Experiência" },
  { key: "reputationAdjustment", label: "Ajuste Reputação" },
];

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

  const data = compare.data;
  const hasDistance = data?.candidates.some(
    (c) => c.scoreBreakdown?.distance != null
  );
  const hasExperience = data?.candidates.some(
    (c) => c.scoreBreakdown?.experience != null
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Link
        href={`/company/projects/${projectId}/ranking`}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Voltar ao ranking
      </Link>

      <div>
        <p className="text-primary text-xs font-bold tracking-widest uppercase">
          Comparação de Candidatos
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {data?.projectTitle}
        </h1>
        {data && (
          <p className="text-muted-foreground text-sm">
            {data.candidates.length} candidatos selecionados, ordenados por
            score de compatibilidade
          </p>
        )}
      </div>

      {data && data.requiredSkills.length > 0 && (
        <Card>
          <CardContent>
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              Skills exigidas pelo projeto
            </p>
            <div className="flex flex-wrap gap-1">
              {data.requiredSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {compare.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: matchIds.length || 2 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      )}

      {data && (
        <Card className="py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-background sticky left-0 min-w-40">
                    Atributo
                  </TableHead>
                  {data.candidates.map((c, i) => (
                    <TableHead
                      key={c.matchId}
                      className={
                        i === 0
                          ? "bg-primary/5 min-w-40 text-center"
                          : "min-w-40 text-center"
                      }
                    >
                      <div className="flex flex-col items-center gap-1 py-2">
                        <Avatar className="size-12">
                          <AvatarImage
                            src={c.profilePhotoUrl ?? undefined}
                            alt=""
                          />
                          <AvatarFallback>
                            {c.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-foreground font-semibold">
                          {c.name}
                        </span>
                        <span className="text-muted-foreground text-xs font-normal">
                          {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                        </span>
                        {i === 0 && (
                          <Badge className="bg-success/15 text-success">
                            <Trophy className="size-3" />
                            Melhor score
                          </Badge>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <GroupHeaderRow
                  label="Score Final"
                  span={data.candidates.length}
                />
                <TableRow>
                  <TableCell className="bg-background sticky left-0">
                    Score Final
                  </TableCell>
                  {data.candidates.map((c) => (
                    <TableCell key={c.matchId} className="text-center">
                      <span className="text-lg font-bold tabular-nums">
                        {c.scoreBreakdown
                          ? `${Math.round(c.scoreBreakdown.finalScore)}%`
                          : "—"}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
                {breakdownRows
                  .filter(
                    (row) =>
                      (row.key !== "distance" || hasDistance) &&
                      (row.key !== "experience" || hasExperience)
                  )
                  .map((row) => (
                    <TableRow key={row.key}>
                      <TableCell className="bg-background text-muted-foreground sticky left-0 pl-6">
                        {row.label}
                      </TableCell>
                      {data.candidates.map((c) => {
                        const value = c.scoreBreakdown?.[row.key];
                        return (
                          <TableCell key={c.matchId} className="text-center">
                            {value != null ? (
                              <div className="mx-auto max-w-16">
                                <span className="text-xs font-semibold tabular-nums">
                                  {value.toFixed(1)}
                                </span>
                                <Progress value={value} className="h-1" />
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}

                <GroupHeaderRow label="Perfil" span={data.candidates.length} />
                <AttrRow
                  label="Avaliação média"
                  candidates={data.candidates}
                  render={(c) =>
                    c.reputation != null ? c.reputation.toFixed(1) : "—"
                  }
                />
                <AttrRow
                  label="Avaliações (confiança)"
                  candidates={data.candidates}
                  render={(c) =>
                    c.totalReviews != null
                      ? `${c.totalReviews} (${c.confidenceScore?.toFixed(0) ?? 0}%)`
                      : "—"
                  }
                />
                <AttrRow
                  label="Nível de experiência"
                  candidates={data.candidates}
                  render={(c) =>
                    c.experienceLevel
                      ? (experienceLabels[c.experienceLevel] ??
                        c.experienceLevel)
                      : "—"
                  }
                />
                <AttrRow
                  label="Disponível agora"
                  candidates={data.candidates}
                  render={(c) =>
                    c.available ? (
                      <Check className="text-success mx-auto size-4" />
                    ) : (
                      <X className="text-destructive mx-auto size-4" />
                    )
                  }
                />
                <AttrRow
                  label="Oportunidades anteriores"
                  candidates={data.candidates}
                  render={(c) => c.previousProjectsCount ?? 0}
                />
                <AttrRow
                  label="Pretensão salarial"
                  candidates={data.candidates}
                  render={(c) =>
                    c.minimumSalary != null || c.maximumSalary != null
                      ? `${money(c.minimumSalary)} – ${money(c.maximumSalary)}`
                      : "—"
                  }
                />

                <GroupHeaderRow label="Skills" span={data.candidates.length} />
                <TableRow>
                  <TableCell className="bg-background text-muted-foreground sticky left-0 pl-6">
                    Skills que possui
                  </TableCell>
                  {data.candidates.map((c) => (
                    <TableCell key={c.matchId}>
                      <div className="flex flex-wrap justify-center gap-1">
                        {c.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="bg-background text-muted-foreground sticky left-0 pl-6">
                    Skills Compatíveis
                  </TableCell>
                  {data.candidates.map((c) => (
                    <TableCell key={c.matchId}>
                      <div className="flex flex-wrap justify-center gap-1">
                        {c.matchingSkills.length > 0 ? (
                          c.matchingSkills.map((skill) => (
                            <Badge
                              key={skill}
                              className="bg-success/15 text-success text-[10px]"
                            >
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="bg-background text-muted-foreground sticky left-0 pl-6">
                    Skills faltantes
                  </TableCell>
                  {data.candidates.map((c) => (
                    <TableCell key={c.matchId}>
                      <div className="flex flex-wrap justify-center gap-1">
                        {c.missingSkills.length > 0 ? (
                          c.missingSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="destructive"
                              className="text-[10px]"
                            >
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                <GroupHeaderRow
                  label="Status & Ação"
                  span={data.candidates.length}
                />
                <TableRow>
                  <TableCell className="bg-background text-muted-foreground sticky left-0 pl-6">
                    Status do match
                  </TableCell>
                  {data.candidates.map((c) => (
                    <TableCell key={c.matchId} className="text-center">
                      <Badge variant="secondary">
                        {matchStatusLabels[c.matchStatus] ?? c.matchStatus}
                      </Badge>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="bg-background sticky left-0 pl-6">
                    Ação
                  </TableCell>
                  {data.candidates.map((c) => (
                    <TableCell key={c.matchId} className="text-center">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/public/professional/${c.professionalId}`}>
                          <User className="size-3.5" />
                          Ver perfil
                        </Link>
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {compare.isSuccess && data && data.candidates.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-semibold">Nenhum candidato para comparar</p>
            <p className="text-muted-foreground text-sm">
              Selecione ao menos 2 candidatos no ranking do projeto.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GroupHeaderRow({ label, span }: { label: string; span: number }) {
  return (
    <TableRow className="bg-primary/5 hover:bg-primary/5">
      <TableCell
        colSpan={span + 1}
        className="text-primary bg-primary/5 sticky left-0 text-xs font-bold tracking-wide uppercase"
      >
        {label}
      </TableCell>
    </TableRow>
  );
}

function AttrRow({
  label,
  candidates,
  render,
}: {
  label: string;
  candidates: CandidateComparisonItemDTO[];
  render: (c: CandidateComparisonItemDTO) => ReactNode;
}) {
  return (
    <TableRow>
      <TableCell className="bg-background text-muted-foreground sticky left-0 pl-6">
        {label}
      </TableCell>
      {candidates.map((c) => (
        <TableCell key={c.matchId} className="text-center">
          {render(c)}
        </TableCell>
      ))}
    </TableRow>
  );
}
