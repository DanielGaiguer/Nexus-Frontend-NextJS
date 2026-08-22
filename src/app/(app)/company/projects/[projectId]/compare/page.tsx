"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Check,
  DollarSign,
  Handshake,
  MapPin,
  Star,
  Trophy,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { toast } from "sonner";

import { ScoreRing } from "@/components/professional/score-ring";
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
import { useCompanyShowInterest } from "@/hooks/mutations/useCompanyMatchActions";
import {
  candidateComparisonKey,
  useCandidateComparison,
} from "@/hooks/queries/useCandidateComparison";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { CandidateComparisonItemDTO } from "@/types/comparison";
import type { ScoreBreakdownDTO } from "@/types/match";

const experienceLabels: Record<string, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
};

const workModeLabels: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
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

const tierClasses = {
  success: { text: "text-success", bar: "bg-success" },
  primary: { text: "text-primary", bar: "bg-primary" },
  warning: { text: "text-warning", bar: "bg-warning" },
  destructive: { text: "text-destructive", bar: "bg-destructive" },
} as const;

/** Mesmos limiares por dimensão do company-comparison.html original — cada
 * linha da tabela de comparação tinha sua própria cor (verde/azul/âmbar/
 * vermelho), não a mesma cor genérica repetida em todas. */
function breakdownTier(
  key: keyof ScoreBreakdownDTO,
  value: number
): keyof typeof tierClasses {
  if (key === "reputationAdjustment")
    return value >= 0 ? "success" : "destructive";
  if (key === "experience") {
    if (value >= 90) return "success";
    if (value >= 70) return "warning";
    return "destructive";
  }
  if (key === "distance") {
    if (value >= 70) return "success";
    if (value >= 50) return "warning";
    return "destructive";
  }
  if (value >= 80) return "success";
  if (value >= 60) return "primary";
  if (value >= 40) return "warning";
  return "destructive";
}

export default function ComparisonPage() {
  return (
    <Suspense fallback={null}>
      <ComparisonContent />
    </Suspense>
  );
}

function ComparisonContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchIds = (searchParams.get("matchIds") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  const request =
    matchIds.length > 0
      ? { projectId: Number(projectId), matchIds }
      : undefined;

  const comparison = useCandidateComparison(request);
  const showInterest = useCompanyShowInterest();
  const queryClient = useQueryClient();
  const compareUrl = `/company/projects/${projectId}/compare?matchIds=${matchIds.join(",")}`;

  const data = comparison.data;
  const hasDistance = data?.candidates.some(
    (c) => c.scoreBreakdown?.distance != null
  );
  const hasExperience = data?.candidates.some(
    (c) => c.scoreBreakdown?.experience != null
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </button>

      <div>
        <p className="text-primary text-xs font-bold tracking-widest uppercase">
          Comparação de Candidatos
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {data?.projectTitle}
          </h1>
          {data && (
            <div className="flex flex-wrap items-center gap-2">
              {data.workMode && (
                <Badge variant="outline">
                  <MapPin className="size-3" />
                  {workModeLabels[data.workMode] ?? data.workMode}
                </Badge>
              )}
              {data.experienceLevelRequired && (
                <Badge variant="outline">
                  <Award className="size-3" />
                  {experienceLabels[data.experienceLevelRequired] ??
                    data.experienceLevelRequired}
                </Badge>
              )}
              {data.opportunityType !== "JOB" &&
                data.minimumBudget != null &&
                data.maximumBudget != null && (
                  <Badge className="bg-success/15 text-success">
                    <DollarSign className="size-3" />
                    {money(data.minimumBudget)}–{money(data.maximumBudget)}
                  </Badge>
                )}
              {data.opportunityType === "JOB" &&
                data.monthlySalaryMin != null && (
                  <Badge className="bg-success/15 text-success">
                    <DollarSign className="size-3" />
                    {money(data.monthlySalaryMin)}/mês
                    {data.monthlySalaryMax != null && (
                      <> –{money(data.monthlySalaryMax)}</>
                    )}
                  </Badge>
                )}
            </div>
          )}
        </div>
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

      {comparison.isPending && matchIds.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: matchIds.length || 2 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      )}

      {comparison.isError && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-semibold">
              Não foi possível comparar os candidatos
            </p>
            <p className="text-muted-foreground text-sm">
              {comparison.error instanceof ApiError
                ? comparison.error.message
                : "Tente novamente em instantes."}
            </p>
          </CardContent>
        </Card>
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
                      <div className="flex justify-center py-1">
                        <ScoreRing
                          score={Math.round(c.scoreBreakdown?.finalScore ?? 0)}
                          size={80}
                        />
                      </div>
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
                        if (value == null) {
                          return (
                            <TableCell key={c.matchId} className="text-center">
                              —
                            </TableCell>
                          );
                        }
                        const tier = tierClasses[breakdownTier(row.key, value)];
                        const isReputationAdjustment =
                          row.key === "reputationAdjustment";
                        const displayValue = isReputationAdjustment
                          ? `${value >= 0 ? "+" : ""}${value.toFixed(1)}`
                          : value.toFixed(1);
                        if (isReputationAdjustment) {
                          return (
                            <TableCell key={c.matchId} className="text-center">
                              <span
                                className={cn(
                                  "text-sm font-semibold tabular-nums",
                                  tier.text
                                )}
                              >
                                {displayValue}
                              </span>
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell key={c.matchId} className="text-center">
                            <div className="mx-auto max-w-16">
                              <span
                                className={cn(
                                  "text-xs font-semibold tabular-nums",
                                  tier.text
                                )}
                              >
                                {displayValue}
                              </span>
                              <Progress
                                value={Math.max(0, Math.min(100, value))}
                                className="h-1"
                                indicatorClassName={tier.bar}
                              />
                            </div>
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
                    c.reputation != null ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-semibold tabular-nums">
                          {c.reputation.toFixed(1)}
                        </span>
                        <span className="inline-flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "size-3",
                                i + 1 <= c.reputation!
                                  ? "fill-warning text-warning"
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </span>
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <AttrRow
                  label="Avaliações (confiança)"
                  candidates={data.candidates}
                  render={(c) => (
                    <div>
                      <span>
                        <span className="font-bold tabular-nums">
                          {c.totalReviews ?? 0}
                        </span>{" "}
                        avaliações
                      </span>
                      {c.confidenceScore != null && (
                        <div
                          className={cn(
                            "text-xs",
                            c.confidenceScore < 50
                              ? "text-destructive"
                              : "text-success"
                          )}
                        >
                          {c.confidenceScore.toFixed(0)}% de confiança
                        </div>
                      )}
                    </div>
                  )}
                />
                <AttrRow
                  label="Nível de experiência"
                  candidates={data.candidates}
                  render={(c) => {
                    const label = c.experienceLevel
                      ? (experienceLabels[c.experienceLevel] ??
                        c.experienceLevel)
                      : "—";
                    const required = data.experienceLevelRequired;
                    const isCompatible =
                      required != null && c.experienceLevel === required;
                    return (
                      <span className="inline-flex items-center gap-1.5">
                        {label}
                        {required != null &&
                          c.experienceLevel != null &&
                          (isCompatible ? (
                            <Check className="text-success size-4" />
                          ) : (
                            <AlertTriangle className="text-warning size-4" />
                          ))}
                      </span>
                    );
                  }}
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
                  render={(c) => {
                    if (c.minimumSalary == null && c.maximumSalary == null) {
                      return "—";
                    }
                    const ceiling =
                      data.opportunityType === "JOB"
                        ? data.monthlySalaryMax
                        : data.maximumBudget;
                    const withinBudget =
                      c.minimumSalary != null && ceiling != null
                        ? c.minimumSalary <= ceiling
                        : null;
                    return (
                      <div>
                        <div>
                          {money(c.minimumSalary)} – {money(c.maximumSalary)}
                        </div>
                        {withinBudget != null && (
                          <div
                            className={cn(
                              "text-xs",
                              withinBudget ? "text-success" : "text-destructive"
                            )}
                          >
                            {withinBudget
                              ? "dentro do orçamento"
                              : "acima do orçamento"}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />

                <GroupHeaderRow label="Skills" span={data.candidates.length} />
                <TableRow>
                  <TableCell className="bg-background text-muted-foreground sticky left-0 pl-6">
                    Skills Compatíveis
                  </TableCell>
                  {data.candidates.map((c) => (
                    <TableCell key={c.matchId}>
                      <div className="flex justify-center">
                        {c.matchingSkills.length > 0 ? (
                          <div className="grid grid-cols-3 justify-items-center gap-1">
                            {c.matchingSkills.map((skill) => (
                              <Badge
                                key={skill}
                                className="bg-success/15 text-success text-[10px]"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
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
                      <div className="flex justify-center">
                        {c.missingSkills.length > 0 ? (
                          <div className="grid grid-cols-3 justify-items-center gap-1">
                            {c.missingSkills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="destructive"
                                className="text-[10px]"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
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
                      <div className="flex flex-col items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={
                              c.matchStatus === "WAITING"
                                ? `/public/professional/${c.professionalId}?${new URLSearchParams(
                                    {
                                      matchId: String(c.matchId),
                                      returnTo: compareUrl,
                                    }
                                  ).toString()}`
                                : `/public/professional/${c.professionalId}`
                            }
                          >
                            <User className="size-3.5" />
                            Ver perfil
                          </Link>
                        </Button>
                        {c.matchStatus === "WAITING" && (
                          <Button
                            size="sm"
                            disabled={showInterest.isPending}
                            onClick={() =>
                              showInterest.mutate(c.matchId, {
                                onSuccess: () => {
                                  toast.success(
                                    "Convite enviado ao profissional!"
                                  );
                                  queryClient.invalidateQueries({
                                    queryKey: candidateComparisonKey(request),
                                  });
                                },
                                onError: (error) =>
                                  toast.error(
                                    error instanceof ApiError
                                      ? error.message
                                      : "Não foi possível enviar o convite."
                                  ),
                              })
                            }
                          >
                            <Handshake className="size-3.5" />
                            Demonstrar interesse
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {comparison.isSuccess && data && data.candidates.length === 0 && (
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
