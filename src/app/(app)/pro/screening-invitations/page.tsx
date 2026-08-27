"use client";

import {
  Briefcase,
  Building2,
  CircleCheck,
  Clock,
  Eye,
  FileQuestion,
  Mail,
  MessageCircle,
  Search,
  Send,
  ThumbsDown,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { MatchCompareDialog } from "@/components/company/match-compare-dialog";
import { ContactDialog } from "@/components/matches/contact-dialog";
import { MatchHistoryDialog } from "@/components/matches/match-history-dialog";
import { MatchReviewDialog } from "@/components/matches/match-review-dialog";
import { ScoreBreakdownGrid } from "@/components/matches/score-breakdown-grid";
import { ScoreRing } from "@/components/professional/score-ring";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanyContact } from "@/hooks/queries/useCompanyContact";
import { useMatches } from "@/hooks/queries/useMatches";
import { useMyScreeningProcesses } from "@/hooks/queries/useScreeningInvitations";
import { useReviewedMatchIds } from "@/hooks/queries/useReviews";
import type { MatchResponseDTO } from "@/types/match";
import {
  screeningInvitationStatusLabels,
  type ScreeningInvitationStatus,
  type ScreeningProcessSummaryDTO,
} from "@/types/screening";

const stageStatusVariant: Record<
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
  CANCELLED: "outline",
};

const inProgressStatuses = new Set<ScreeningInvitationStatus>([
  "SENT",
  "IN_PROGRESS",
  "SUBMITTED",
]);
const closedStatuses = new Set<ScreeningInvitationStatus>([
  "DECLINED",
  "EXPIRED",
  "CANCELLED",
]);

function filterProcesses(
  processes: ScreeningProcessSummaryDTO[] | undefined,
  term: string
) {
  const trimmed = term.trim().toLowerCase();
  if (!trimmed) return processes;
  return processes?.filter(
    (p) =>
      p.projectTitle.toLowerCase().includes(trimmed) ||
      p.companyName.toLowerCase().includes(trimmed)
  );
}

/** Ações de match confirmado -- só aparecem quando o processo já virou um Match MATCHED (mesmo
 * conjunto de botões de ConfirmedMatchCard em /pro/matches). */
function ConfirmedMatchActions({ match }: { match: MatchResponseDTO }) {
  const [revealed, setRevealed] = useState(false);
  const contact = useCompanyContact(match.project.companyId ?? 0, revealed);
  const { data: reviewedMatchIds } = useReviewedMatchIds("professional");
  const reviewed = reviewedMatchIds?.includes(match.id) ?? false;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setRevealed(true)}>
        <Mail className="size-4" />
        Entrar em contato
      </Button>
      <ContactDialog
        open={revealed}
        onOpenChange={setRevealed}
        isLoading={contact.isLoading}
        isError={contact.isError}
        email={contact.data?.email}
        phone={contact.data?.phone}
      />
      <Button size="sm" variant="outline" asChild>
        <Link href={`/chat/${match.id}`}>
          <MessageCircle className="size-4" />
          Chat
        </Link>
      </Button>
      {reviewed ? (
        <Button size="sm" variant="ghost" disabled>
          <CircleCheck className="size-4" />
          Avaliado
        </Button>
      ) : (
        <MatchReviewDialog
          matchId={match.id}
          authorType="PROFESSIONAL"
          projectTitle={match.project.title}
        />
      )}
    </>
  );
}

function ProcessCard({
  process,
  match,
}: {
  process: ScreeningProcessSummaryDTO;
  match: MatchResponseDTO | undefined;
}) {
  const isPending =
    process.currentStatus === "SENT" || process.currentStatus === "IN_PROGRESS";
  const href = isPending
    ? `/pro/screening-invitations/${process.currentInvitationId}/take`
    : `/pro/screening-invitations/${process.currentInvitationId}`;
  const isJob = process.opportunityType === "JOB";
  const isMatched = match?.status === "MATCHED";

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="size-12 shrink-0">
            <AvatarImage
              src={process.companyProfilePhotoUrl ?? undefined}
              alt=""
            />
            <AvatarFallback>
              {process.companyName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <div className="font-semibold">{process.projectTitle}</div>
              <Badge variant={isJob ? "default" : "secondary"} className="mt-1">
                {isJob ? (
                  <Building2 className="size-3" />
                ) : (
                  <Briefcase className="size-3" />
                )}
                {isJob ? "Vaga" : "Projeto"}
              </Badge>
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                {process.companyName}
              </div>
            </div>

            <Badge
              variant={stageStatusVariant[process.currentStatus] ?? "outline"}
              className="w-fit"
            >
              Etapa {process.currentStageOrderIndex}/{process.totalStages}:{" "}
              {screeningInvitationStatusLabels[process.currentStatus]}
            </Badge>
          </div>

          <ScoreRing
            score={Math.round(process.scoreBreakdown.finalScore)}
            size={84}
          />
        </div>

        <ScoreBreakdownGrid breakdown={process.scoreBreakdown} />

        {/* Única diferença pro card de match/proposta -- abaixo dos índices, todas as etapas
            do processo e seus status. */}
        <div className="flex flex-col gap-1.5 border-t pt-3">
          {process.stages.map((stage) => (
            <div
              key={stage.stageId}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span
                className={
                  stage.status == null ? "text-muted-foreground" : undefined
                }
              >
                {stage.orderIndex + 1}. {stage.title}
              </span>
              {stage.status ? (
                <Badge variant={stageStatusVariant[stage.status] ?? "outline"}>
                  {screeningInvitationStatusLabels[stage.status]}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Aguardando etapas anteriores
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-3">
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/public/opportunity/${process.projectId}`}>
            <Eye className="size-4" />
            Ver oportunidade
          </Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/pro/companies/${process.companyId}`}>
            <Building2 className="size-4" />
            Ver contratante
          </Link>
        </Button>
        {match && <MatchCompareDialog match={match} viewer="professional" />}
        {match && <MatchHistoryDialog matchId={match.id} />}
        {isMatched && match && <ConfirmedMatchActions match={match} />}
        <Button size="sm" asChild>
          <Link href={href}>
            <FileQuestion className="size-4" />
            {isPending ? "Responder" : "Ver detalhes"}
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-48" />
      ))}
    </div>
  );
}

function ProcessList({
  processes,
  matches,
  isLoading,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: {
  processes: ScreeningProcessSummaryDTO[] | undefined;
  matches: MatchResponseDTO[];
  isLoading: boolean;
  emptyIcon: typeof FileQuestion;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (isLoading) return <Loading />;
  if (!processes || processes.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }
  return processes.map((process) => (
    <ProcessCard
      key={process.screeningQuestionnaireId}
      process={process}
      match={matches.find(
        (m) =>
          m.project.id === process.projectId &&
          m.project.companyId === process.companyId
      )}
    />
  ));
}

export default function ProcessosSeletivosPage() {
  const { data, isLoading } = useMyScreeningProcesses();
  const matchesQuery = useMatches();
  const [search, setSearch] = useState("");

  const filtered = filterProcesses(data, search);
  const inProgress = filtered?.filter((p) =>
    inProgressStatuses.has(p.currentStatus)
  );
  const approved = filtered?.filter((p) => p.currentStatus === "APPROVED");
  const reproved = filtered?.filter((p) => p.currentStatus === "REPROVED");
  const closed = filtered?.filter((p) => closedStatuses.has(p.currentStatus));
  const allMatches = matchesQuery.data ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Processos Seletivos
        </h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe as etapas de cada processo seletivo em que você está
        </p>
      </div>

      <div className="max-w-sm space-y-1">
        <Label className="text-xs">Buscar</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por vaga ou contratante..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="inProgress">
        <div className="mb-[3px] flex flex-col gap-1.5 md:hidden">
          <TabsList className="w-full">
            <TabsTrigger value="inProgress">
              Em andamento{" "}
              <Badge variant="secondary">{inProgress?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="approved">
              Aprovados{" "}
              <Badge variant="secondary">{approved?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="reproved">
              Reprovados{" "}
              <Badge variant="secondary">{reproved?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full">
            <TabsTrigger value="closed">
              Encerrados{" "}
              <Badge variant="secondary">{closed?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsList className="mb-[3px] hidden md:inline-flex">
          <TabsTrigger value="inProgress">
            Em andamento{" "}
            <Badge variant="secondary">{inProgress?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovados <Badge variant="secondary">{approved?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reproved">
            Reprovados{" "}
            <Badge variant="secondary">{reproved?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="closed">
            Encerrados <Badge variant="secondary">{closed?.length ?? 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inProgress" className="flex flex-col gap-3">
          <ProcessList
            processes={inProgress}
            matches={allMatches}
            isLoading={isLoading}
            emptyIcon={Clock}
            emptyTitle="Nenhum processo em andamento"
            emptyDescription="Ao demonstrar interesse, aceitar um convite ou enviar uma proposta pra uma vaga com processo seletivo, ele aparece aqui."
          />
        </TabsContent>

        <TabsContent value="approved" className="flex flex-col gap-3">
          <ProcessList
            processes={approved}
            matches={allMatches}
            isLoading={isLoading}
            emptyIcon={Send}
            emptyTitle="Nenhum processo aprovado ainda"
            emptyDescription="Processos em que você foi aprovado em todas as etapas aparecerão aqui."
          />
        </TabsContent>

        <TabsContent value="reproved" className="flex flex-col gap-3">
          <ProcessList
            processes={reproved}
            matches={allMatches}
            isLoading={isLoading}
            emptyIcon={ThumbsDown}
            emptyTitle="Nenhum processo reprovado"
            emptyDescription="Processos em que você não avançou em alguma etapa aparecerão aqui."
          />
        </TabsContent>

        <TabsContent value="closed" className="flex flex-col gap-3">
          <ProcessList
            processes={closed}
            matches={allMatches}
            isLoading={isLoading}
            emptyIcon={XCircle}
            emptyTitle="Nenhum processo encerrado"
            emptyDescription="Processos recusados, expirados ou cancelados aparecerão aqui."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
